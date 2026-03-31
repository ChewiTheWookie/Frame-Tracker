use crate::database::db::UserDb;
use crate::database::repositories::mastery_repo;
use tauri::State;

#[tauri::command]
pub async fn set_mastery(
    state: State<'_, UserDb>,
    item_id: String,
    field: String
) -> Result<(), String> {
    mastery_repo::toggle_mastery_field(&state.0, &item_id, &field).await
}
