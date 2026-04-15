use crate::database::db::UserDb;
use crate::database::repositories::song_repo;
use tauri::State;

#[tauri::command]
pub async fn get_song_details(
    state: State<'_, UserDb>,
    name: String
) -> Result<Option<String>, String> {
    song_repo::fetch_song_string(&state.0, &name).await.map_err(|e| e.to_string())
}
