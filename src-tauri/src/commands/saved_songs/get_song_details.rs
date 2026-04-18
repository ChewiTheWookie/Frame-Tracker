use crate::database::db::UserDb;
use crate::database::repositories::song_repo;
use tauri::State;

#[tauri::command]
pub async fn get_song_details(
    state: State<'_, UserDb>,
    name: String,
) -> Result<Option<String>, String> {
    let pool_guard = state.0.lock().await;

    let song = song_repo::fetch_song_string(&*&pool_guard, &name)
        .await
        .map_err(|e| e.to_string())?;

    Ok(song)
}
