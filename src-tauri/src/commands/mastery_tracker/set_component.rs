use crate::database::db::UserDb;
use crate::database::repositories::mastery_repo;
use tauri::State;
use tauri_plugin_log::log::{ debug, error, info };

#[tauri::command]
pub async fn set_component(
    state: State<'_, UserDb>,
    item_id: String,
    component_name: String,
    quantity: i32
) -> Result<(), String> {
    debug!(
        "set_component called | Item: {} | Component: {} | New Quantity: {}",
        item_id,
        component_name,
        quantity
    );

    let pool_guard = state.0.lock().await;

    mastery_repo
        ::update_component_quantity(&*pool_guard, &item_id, &component_name, quantity).await
        .map_err(|e| {
            let err_msg = format!(
                "Failed to update component '{}' for item '{}': {}",
                component_name,
                item_id,
                e
            );
            error!("{}", err_msg);
            err_msg
        })?;

    info!("Successfully updated '{}' ({}) to quantity: {}", component_name, item_id, quantity);

    Ok(())
}
