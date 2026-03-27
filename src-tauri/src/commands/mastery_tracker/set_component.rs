use tauri::State;
use crate::database::db::UserDb;
use crate::database::repositories::mastery_repo;

#[tauri::command]
pub async fn set_component(
    state: State<'_, UserDb>,
    item_id: String,
    component_name: String,
    quantity: i32
) -> Result<(), String> {
    mastery_repo
        ::update_component_quantity(&state.0, &item_id, &component_name, quantity).await
        .map_err(|e| e.to_string())
}
