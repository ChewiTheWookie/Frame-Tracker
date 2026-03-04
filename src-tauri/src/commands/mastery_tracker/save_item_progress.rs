use crate::database::db::{ DbState, DbUserProgress };
use crate::database::services::mastery_service;
use tauri::State;

#[tauri::command]
pub async fn save_item_progress(
    id: String,
    progress: DbUserProgress,
    state: State<'_, DbState>
) -> Result<(), String> {
    mastery_service::save_progress(&state.pool, &id, &progress).await.map_err(|e| e.to_string())
}
