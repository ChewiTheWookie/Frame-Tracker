use crate::api::requests::get_wiki_data;
use crate::models::mastery_tracker::ProcessedItem;

#[tauri::command]
pub async fn fetch_wiki_data() -> Result<Vec<ProcessedItem>, String> {
    get_wiki_data().await
}
