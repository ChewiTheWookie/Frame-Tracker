use crate::database::db::UserDb;
use crate::database::repositories::task_repo;
use tauri::State;
use tauri_plugin_log::log::{ debug, error, info };

#[tauri::command]
pub async fn set_favorite(
    id: String,
    is_favorite: bool,
    state: State<'_, UserDb>
) -> Result<(), String> {
    debug!("set_favorite called | ID: {} | Status: {}", id, is_favorite);

    let pool_guard = state.0.lock().await;

    task_repo::set_favorite_status(&*pool_guard, &id, is_favorite).await.map_err(|e| {
        let err = format!("Failed to set favorite status for task '{}': {}", id, e);
        error!("{}", err);
        err
    })?;

    info!("Updated favorite status for task '{}' to {}", id, is_favorite);

    Ok(())
}
