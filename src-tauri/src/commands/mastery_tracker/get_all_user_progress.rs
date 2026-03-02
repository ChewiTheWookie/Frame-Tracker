use crate::database::db::{ DbState, DbUserProgress };
use crate::database::services::mastery;
use tauri::State;
use std::collections::HashMap;

#[tauri::command]
pub async fn get_all_user_progress(
    state: State<'_, DbState>
) -> Result<HashMap<String, DbUserProgress>, String> {
    mastery::fetch_all_progress(&state.pool).await.map_err(|e| e.to_string())
}
