use crate::database::db::UserDb;
use crate::database::repositories::song_repo;
use tauri::State;
use tauri_plugin_log::log::{ debug, error };

#[tauri::command]
pub async fn get_song_names(
    state: State<'_, UserDb>,
    search: String,
    limit: i64,
    offset: i64
) -> Result<Vec<String>, String> {
    debug!("get_song_names called | search: '{}' | limit: {} | offset: {}", search, limit, offset);

    let pool_guard = state.0.lock().await;

    let names = song_repo
        ::fetch_song_names(&*pool_guard, &search, limit, offset).await
        .map_err(|e| {
            let err = format!("Failed to fetch song names: {}", e);
            error!("{}", err);
            err
        })?;

    debug!("Retrieved {} song names", names.len());

    Ok(names)
}
