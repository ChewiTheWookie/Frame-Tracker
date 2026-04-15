use crate::database::db::UserDb;
use crate::database::repositories::song_repo;
use tauri::State;

#[tauri::command]
pub async fn get_song_names(state: State<'_, UserDb>) -> Result<Vec<String>, String> {
    song_repo::fetch_song_names(&state.0).await.map_err(|e| e.to_string())
}
