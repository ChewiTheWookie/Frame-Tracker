use crate::database::db::UserDb;
use crate::database::repositories::song_repo;
use tauri::State;

#[tauri::command]
pub async fn set_song(
    state: State<'_, UserDb>,
    name: String,
    song_string: String
) -> Result<i64, String> {
    song_repo::add_song(&state.0, &name, &song_string).await.map_err(|e| e.to_string())
}
