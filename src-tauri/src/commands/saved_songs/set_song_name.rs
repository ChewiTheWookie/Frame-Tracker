use tauri::State;
use crate::database::{ db::UserDb, repositories::song_repo };
use tauri_plugin_log::log::{ debug, error, info };

#[tauri::command]
pub async fn set_song_name(
    state: State<'_, UserDb>,
    old_name: String,
    new_name: String
) -> Result<(), String> {
    debug!("set_song_name called | Old: '{}' -> New: '{}'", old_name, new_name);

    let pool_guard = state.0.lock().await;

    song_repo::rename_song(&*pool_guard, &old_name, &new_name).await.map_err(|e| {
        let err = format!("Failed to rename song from '{}' to '{}': {}", old_name, new_name, e);
        error!("{}", err);
        err
    })?;

    info!("Successfully renamed song: '{}' to '{}'", old_name, new_name);

    Ok(())
}
