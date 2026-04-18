use crate::database::db::UserDb;
use crate::database::repositories::song_repo;
use tauri::State;

#[tauri::command]
pub async fn get_song_names(
    state: State<'_, UserDb>,
    search: String,
    limit: i64,
    offset: i64
) -> Result<Vec<String>, String> {
    let pool_guard = state.0.lock().await;

    song_repo
        ::fetch_song_names(&*pool_guard, &search, limit, offset).await
        .map_err(|e| e.to_string())
}
