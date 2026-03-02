use crate::api::requests::get_wiki_data;
use crate::database::services::mastery;
use sqlx::SqlitePool;
use std::collections::HashMap;

pub async fn get_merged_inventory(pool: &SqlitePool) -> Result<Vec<serde_json::Value>, String> {
    let progress_map = mastery::fetch_all_progress(pool).await.map_err(|e| e.to_string())?;

    let wiki_items = get_wiki_data().await?;

    let merged = wiki_items
        .into_iter()
        .map(|item| {
            let saved = progress_map.get(&item.id);

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
                "mastered": saved.map(|s| s.mastered).unwrap_or(false),
                "helminthed": saved.map(|s| s.helminthed).unwrap_or(false),
                "owned": saved.map(|s| s.owned).unwrap_or(false),
                "craftable": saved.map(|s| s.craftable).unwrap_or(false),
                "parts": parts
            })
        })
        .collect();

    Ok(merged)
}
