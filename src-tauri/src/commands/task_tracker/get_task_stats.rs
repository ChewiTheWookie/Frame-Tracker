use crate::database::db::UserDb;
use crate::models::database::stats::TaskStats;

#[tauri::command]
pub async fn get_task_stats(
    state: tauri::State<'_, UserDb>,
    category: String
) -> Result<TaskStats, String> {
    let pool = &state.0;

    let row = sqlx
        ::query_as::<_, (i32, i32)>(
            r#"
        SELECT 
            COUNT(*), 
            CAST(COALESCE(SUM(CASE WHEN current_completions >= max_completions THEN 1 ELSE 0 END), 0) AS INTEGER) 
        FROM task_tracker 
        WHERE (category = ? OR ? = 'All')
        "#
        )
        .bind(&category)
        .bind(&category)
        .fetch_one(pool).await
        .map_err(|e| e.to_string())?;

    Ok(TaskStats {
        current: row.1,
        total: row.0,
    })
}
