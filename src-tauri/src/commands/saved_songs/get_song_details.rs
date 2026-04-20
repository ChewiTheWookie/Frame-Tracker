use crate::database::db::UserDb;
use crate::database::repositories::song_repo;
use tauri::State;
use tauri_plugin_log::log::{ debug, error };

#[tauri::command]
pub async fn get_song_details(
    state: State<'_, UserDb>,
    name: String
) -> Result<Option<String>, String> {
    debug!("get_song_details called | Name: {}", name);

    let pool_guard = state.0.lock().await;

    let song = song_repo::fetch_song_string(&*pool_guard, &name).await.map_err(|e| {
        let err = format!("Failed to fetch song details for '{}': {}", name, e);
        error!("{}", err);
        err
    })?;

    if song.is_some() {
        debug!("Successfully retrieved details for song: {}", name);
    } else {
        debug!("No song details found for: {}", name);
    }

    Ok(song)
}
