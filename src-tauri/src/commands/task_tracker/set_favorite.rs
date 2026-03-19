use crate::database::db::UserDb;

#[tauri::command]
pub async fn set_favorite(
    id: String,
    is_favorite: bool,
    state: tauri::State<'_, UserDb>
) -> Result<(), String> {
    let pool = &state.0;
    let favorite_val = if is_favorite { 1 } else { 0 };

    sqlx
        ::query("UPDATE task_tracker 
         SET favorite = ? 
         WHERE id = ?")
        .bind(favorite_val)
        .bind(&id)
        .execute(&*pool).await
        .map_err(|e| format!("Failed to update favorite status: {}", e))?;

    Ok(())
}
