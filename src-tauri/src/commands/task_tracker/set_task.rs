use crate::database::db::UserDb;
use crate::database::services::task_services::{
    get_current_period_start,
    calculate_rolling_reset_backdate,
};
use crate::models::database::task::Task;

#[tauri::command]
pub async fn set_task(
    state: tauri::State<'_, UserDb>,
    id: String,
    count: i32
) -> Result<Task, String> {
    let pool = &state.0;

    let task = sqlx
        ::query_as::<_, Task>("SELECT * FROM task_tracker WHERE id = ?")
        .bind(&id)
        .fetch_one(pool).await
        .map_err(|e| format!("Failed to find task: {}", e))?;

    let interval_str = task.reset_interval.as_deref().unwrap_or("daily");

    let is_rolling =
        !interval_str.to_lowercase().starts_with("daily") &&
        !interval_str.to_lowercase().starts_with("weekly") &&
        !interval_str.to_lowercase().ends_with("_world");

    let final_reset_time = if is_rolling && count == 0 {
        calculate_rolling_reset_backdate(interval_str)
    } else {
        get_current_period_start(interval_str)
    };

    let updated_task = sqlx
        ::query_as::<_, Task>(
            r#"
        UPDATE task_tracker 
        SET current_completions = CASE 
            WHEN ? > max_completions THEN max_completions 
            WHEN ? < 0 THEN 0 
            ELSE ? 
        END,
        last_reset = ?
        WHERE id = ?
        RETURNING *
        "#
        )
        .bind(count)
        .bind(count)
        .bind(count)
        .bind(final_reset_time.to_rfc3339())
        .bind(id)
        .fetch_one(pool).await
        .map_err(|e| e.to_string())?;

    Ok(updated_task)
}
