use crate::database::db::UserDb;
use crate::database::repositories::mastery_repo;
use tauri::State;

#[tauri::command]
pub async fn set_component(
    state: State<'_, UserDb>,
    item_id: String,
    component_name: String,
    quantity: i32
) -> Result<(), String> {
    let pool_guard = state.0.lock().await;

    let _ = mastery_repo
        ::update_component_quantity(&*pool_guard, &item_id, &component_name, quantity).await
        .map_err(|e| e.to_string())?;

    Ok(())
}
