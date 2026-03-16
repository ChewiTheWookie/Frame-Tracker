use crate::database::db::UserDb;
use crate::models::database::filters::TaskFilters;
use crate::models::database::task::Task;

#[tauri::command]
pub async fn get_tasks(
    category: String,
    search: String,
    filters: TaskFilters,
    limit: i64,
    offset: i64,
    state: tauri::State<'_, UserDb>
) -> Result<Vec<Task>, String> {
    let pool = &state.0;
    let search_pattern = format!("%{}%", search);

    let tasks = sqlx
        ::query_as::<_, Task>(
            r#"
        SELECT * FROM task_tracker 
        WHERE (category = ? OR ? = 'All')
        AND (name LIKE ? OR tags LIKE ? OR location LIKE ?)
        AND (NOT (? AND current_completions < max_completions))
        AND (NOT (? AND current_completions >= max_completions))
        ORDER BY name ASC
        LIMIT ? OFFSET ? -- Added pagination
        "#
        )
        .bind(&category)
        .bind(&category)
        .bind(&search_pattern)
        .bind(&search_pattern)
        .bind(&search_pattern)
        .bind(filters.hide_incomplete)
        .bind(filters.hide_complete)
        .bind(limit)
        .bind(offset)
        .fetch_all(&*pool).await;

    tasks.map_err(|e| e.to_string())
}
