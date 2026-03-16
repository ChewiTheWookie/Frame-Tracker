use tauri::State;
use crate::database::db::UserDb;

#[tauri::command]
pub async fn set_component(
    state: State<'_, UserDb>,
    item_id: String,
    component_name: String,
    quantity: i32
) -> Result<(), String> {
    let pool = &state.0;

    sqlx
        ::query(
            r#"
        UPDATE item_components 
        SET owned_quantity = CASE 
            WHEN ? > needed_quantity THEN needed_quantity 
            WHEN ? < 0 THEN 0 
            ELSE ? 
        END
        WHERE item_id = ? AND component_name = ?
        "#
        )
        .bind(quantity)
        .bind(quantity)
        .bind(quantity)
        .bind(item_id)
        .bind(component_name)
        .execute(pool).await
        .map_err(|e| e.to_string())?;

    Ok(())
}
