use crate::database::{ DbState };
use crate::commands::mastery_db::{ get_all_user_progress };
use tauri::State;
use std::collections::HashMap;

#[tauri::command]
pub async fn fetch_wiki_data(state: State<'_, DbState>) -> Result<Vec<serde_json::Value>, String> {
    let progress_map = get_all_user_progress(state).await?;

    let wiki_items = crate::api::requests::get_wiki_data().await?;

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
