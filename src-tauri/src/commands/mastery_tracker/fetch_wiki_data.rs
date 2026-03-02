use crate::database::db::DbState;
use crate::database::services::inventory;
use tauri::State;

#[tauri::command]
pub async fn fetch_wiki_data(state: State<'_, DbState>) -> Result<Vec<serde_json::Value>, String> {
    inventory::get_merged_inventory(&state.pool, &state.wiki_cache).await
}
