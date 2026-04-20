use crate::database::db::UserDb;
use crate::database::repositories::mastery_repo;
use tauri::State;
use tauri_plugin_log::log::{ debug, error, info };

#[tauri::command]
pub async fn set_mastery(
    state: State<'_, UserDb>,
    item_id: String,
    field: String
) -> Result<(), String> {
    debug!("set_mastery called | Item: {} | Field: {}", item_id, field);

    let pool_guard = state.0.lock().await;

    mastery_repo::toggle_mastery_field(&*pool_guard, &item_id, &field).await.map_err(|e| {
        let err_msg = format!(
            "Failed to toggle mastery field '{}' for item '{}': {}",
            field,
            item_id,
            e
        );
        error!("{}", err_msg);
        err_msg
    })?;

    info!("Successfully toggled field '{}' for item '{}'", field, item_id);

    Ok(())
}
