use crate::api::requests::get_wiki_data;
use crate::database::services::mastery;
use crate::models::mastery_tracker::{ MasteryFilters, ProcessedItem };
use sqlx::SqlitePool;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;

pub async fn get_merged_inventory(
    pool: &SqlitePool,
    cache: &Arc<Mutex<Option<Vec<ProcessedItem>>>>,
    search: String,
    active_category: String,
    filters: MasteryFilters
) -> Result<Vec<serde_json::Value>, String> {
    let mut cache_lock = cache.lock().await;

    let wiki_items = if let Some(cached_data) = &*cache_lock {
        cached_data.clone()
    } else {
        let fresh_data = get_wiki_data().await?;
        *cache_lock = Some(fresh_data.clone());
        fresh_data
    };

    drop(cache_lock);

    let progress_map = mastery::fetch_all_progress(pool).await.map_err(|e| e.to_string())?;

    let search_lower = search.to_lowercase();

    let merged = wiki_items
        .into_iter()
        .filter(|item| {
            if active_category != "All" && item.category != active_category {
                return false;
            }

            if !search_lower.is_empty() && !item.name.to_lowercase().contains(&search_lower) {
                return false;
            }

            let saved = progress_map.get(&item.id);
            let mastered = saved.map(|s| s.mastered).unwrap_or(false);
            let helminthed = saved.map(|s| s.helminthed).unwrap_or(false);
            let owned = saved.map(|s| s.owned).unwrap_or(false);
            let craftable = saved.map(|s| s.craftable).unwrap_or(false);

            let is_actually_owned = owned || mastered || helminthed || craftable;
            let is_actually_craftable = craftable && !owned && !mastered;

            if filters.non_primes_only && item.is_prime {
                return false;
            }
            if filters.primes_only && !item.is_prime {
                return false;
            }
            if filters.hide_fed && helminthed {
                return false;
            }
            if filters.hide_owned && mastered {
                return false;
            }
            if filters.hide_unowned && !is_actually_owned {
                return false;
            }
            if filters.craftable_only && is_actually_craftable {
                return false;
            }
            if filters.owned_only && owned && !mastered {
                return false;
            }

            true
        })
        .map(|item| {
            let saved = progress_map.get(&item.id);

            let mastered = saved.map(|s| s.mastered).unwrap_or(false);
            let helminthed = saved.map(|s| s.helminthed).unwrap_or(false);
            let owned = saved.map(|s| s.owned).unwrap_or(false);
            let craftable = saved.map(|s| s.craftable).unwrap_or(false);

            let parts = saved
                .map(|s| s.parts.clone())
                .unwrap_or_else(|| {
                    let mut default_parts = HashMap::new();
                    if item.components.is_empty() {
                        default_parts.insert("Blueprint".to_string(), false);
                    } else {
                        for comp in &item.components {
                            default_parts.insert(comp.name.clone(), false);
                        }
                    }
                    default_parts
                });

            serde_json::json!({
        "id": item.id,
        "name": item.name,
        "image": item.image,
        "category": item.category,
        "isPrime": item.is_prime,
        "isFeedable": item.is_feedable,
        "components": item.components,
        "mastered": mastered,
        "helminthed": helminthed,
        "owned": owned,
        "craftable": craftable,
        "parts": parts
    })
        })
        .collect();

    Ok(merged)
}
