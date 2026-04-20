use tauri::State;
use tauri_plugin_log::log::{ debug, error, info };

use crate::database::{ db::UserDb, repositories::song_repo };

#[tauri::command]
pub async fn delete_song(state: State<'_, UserDb>, name: String) -> Result<(), String> {
    debug!("delete_song called | Song Name: {}", name);

    let pool_guard = state.0.lock().await;

    song_repo::delete_song(&*pool_guard, &name).await.map_err(|e| {
        let err_msg = format!("Failed to delete song '{}' from database: {}", name, e);
        error!("{}", err_msg);
        err_msg
    })?;

    info!("Successfully deleted song '{}' from the database", name);

    Ok(())
}
