use crate::database::db::UserDb;
use crate::database::repositories::song_repo;
use tauri::State;

#[tauri::command]
pub async fn set_song(
    state: State<'_, UserDb>,
    name: String,
    song_string: String,
) -> Result<(), String> {
    let pool_guard = state.0.lock().await;

    let _ = song_repo::add_song(&*&pool_guard, &name, &song_string)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
