use tauri::State;
use crate::database::db::UserDb;
use crate::database::repositories::task_repo;

#[tauri::command]
pub async fn set_favorite(
    id: String,
    is_favorite: bool,
    state: State<'_, UserDb>
) -> Result<(), String> {
    task_repo::set_favorite_status(&state.0, &id, is_favorite).await.map_err(|e| e.to_string())
}
