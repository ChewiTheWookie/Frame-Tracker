use crate::database::db::UserDb;
use crate::database::repositories::mastery_repo;
use crate::models::database::filters::MasteryFilters;
use crate::models::database::item::Item;
use tauri::State;
use tauri_plugin_log::log::{ debug, error };

#[tauri::command]
pub async fn get_items(
    state: State<'_, UserDb>,
    category: String,
    search: String,
    filters: MasteryFilters,
    limit: i64,
    offset: i64
) -> Result<Vec<Item>, String> {
    debug!(
        "get_items | category: {} | search: '{}' | limit: {} | offset: {}",
        category,
        search,
        limit,
        offset
    );

    debug!("Active Filters: {:?}", filters);

    let pool_guard = state.0.lock().await;

    let items = mastery_repo
        ::find_all_items(&*pool_guard, &category, &search, &filters, limit, offset).await
        .map_err(|e| {
            let err_msg = format!("Failed to fetch items from mastery_repo: {}", e);
            error!("{}", err_msg);
            err_msg
        })?;

    debug!("Successfully fetched {} items", items.len());

    Ok(items)
}
