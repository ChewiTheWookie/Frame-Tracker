use crate::database::db::UserDb;
use crate::database::repositories::song_repo;
use tauri::State;
use tauri_plugin_log::log::{ debug, error, info };

#[tauri::command]
pub async fn set_song(
    state: State<'_, UserDb>,
    name: String,
    song_string: String
) -> Result<(), String> {
    debug!("set_song called | Name: {}", name);

    let pool_guard = state.0.lock().await;

    song_repo::add_song(&*pool_guard, &name, &song_string).await.map_err(|e| {
        let err = format!("Failed to save song '{}': {}", name, e);
        error!("{}", err);
        err
    })?;

    info!("Successfully saved song: {}", name);

    Ok(())
}
