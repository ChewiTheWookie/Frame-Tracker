use crate::database::db::UserDb;
use crate::database::repositories::song_repo;
use tauri::State;

#[tauri::command]
pub async fn get_song_names(state: State<'_, UserDb>) -> Result<Vec<String>, String> {
    let pool_guard = state.0.lock().await;

    let songs = song_repo::fetch_song_names(&*&pool_guard).await.map_err(|e| e.to_string())?;

    Ok(songs)
}
