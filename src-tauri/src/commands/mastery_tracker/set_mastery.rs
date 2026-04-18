use crate::database::db::UserDb;
use crate::database::repositories::mastery_repo;
use tauri::State;

#[tauri::command]
pub async fn set_mastery(
    state: State<'_, UserDb>,
    item_id: String,
    field: String,
) -> Result<(), String> {
    let pool_guard = state.0.lock().await;

    let _ = mastery_repo::toggle_mastery_field(&*pool_guard, &item_id, &field).await?;

    Ok(())
}
