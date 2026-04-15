use tauri::State;

use crate::database::{ db::UserDb, repositories::song_repo };

#[tauri::command]
pub async fn delete_song(state: State<'_, UserDb>, name: String) -> Result<(), String> {
    let pool_guard = state.0.lock().await;

    let _ = song_repo::delete_song(&*pool_guard, &name).await.map_err(|e| e.to_string())?;

    Ok(())
}
