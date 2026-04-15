use tauri::State;

use crate::database::{ db::UserDb, repositories::song_repo };

#[tauri::command]
pub async fn set_song_name(
    state: State<'_, UserDb>,
    old_name: String,
    new_name: String
) -> Result<(), String> {
    let pool_guard = state.0.lock().await;

    let _ = song_repo
        ::rename_song(&*pool_guard, &old_name, &new_name).await
        .map_err(|e| e.to_string())?;

    Ok(())
}
