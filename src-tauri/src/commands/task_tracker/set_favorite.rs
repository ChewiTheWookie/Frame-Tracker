use crate::database::db::UserDb;
use crate::database::repositories::task_repo;
use tauri::State;

#[tauri::command]
pub async fn set_favorite(
    id: String,
    is_favorite: bool,
    state: State<'_, UserDb>
) -> Result<(), String> {
    let pool_guard = state.0.lock().await;

    let _ = task_repo
        ::set_favorite_status(&*pool_guard, &id, is_favorite).await
        .map_err(|e| e.to_string())?;

    Ok(())
}
