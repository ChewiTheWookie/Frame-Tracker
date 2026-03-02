use crate::database::db::DbState;
use crate::database::services::inventory;
use crate::models::mastery_tracker::MasteryFilters;
use tauri::State;

#[tauri::command]
pub async fn fetch_wiki_data(
    state: State<'_, DbState>,
    search: String,
    active_category: String,
    filters: MasteryFilters
) -> Result<Vec<serde_json::Value>, String> {
    inventory::get_merged_inventory(
        &state.pool,
        &state.wiki_cache,
        search,
        active_category,
        filters
    ).await
}
