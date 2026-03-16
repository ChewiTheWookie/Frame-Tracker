use tauri::State;
use crate::database::db::UserDb;

#[tauri::command]
pub async fn set_mastery(
    state: State<'_, UserDb>,
    item_id: String,
    field: String
) -> Result<(), String> {
    let pool = &state.0;

    let query = match field.as_str() {
        "mastered" => "UPDATE mastery_tracker SET mastered = NOT mastered WHERE id = ?",
        "owned" => "UPDATE mastery_tracker SET owned = NOT owned WHERE id = ?",
        "helminthed" => "UPDATE mastery_tracker SET helminthed = NOT helminthed WHERE id = ?",
        _ => {
            return Err("Invalid field name".into());
        }
    };

    sqlx
        ::query(query)
        .bind(item_id)
        .execute(pool).await
        .map_err(|e| e.to_string())?;

    Ok(())
}
