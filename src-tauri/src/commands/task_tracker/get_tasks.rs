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
        -- Completion Filters
        AND (NOT (? AND current_completions < max_completions))
        AND (NOT (? AND current_completions >= max_completions))
        -- Favorite Filters
        AND (NOT (? AND favorite = 1))  -- hideFavorite
        AND (NOT (? AND favorite = 0))  -- hideNonFavorite
        ORDER BY 
            CASE WHEN ? THEN favorite END DESC, -- favoriteFirst logic
            name ASC
        LIMIT ? OFFSET ?
        "#
        )
        .bind(&category)
        .bind(&category)
        .bind(&search_pattern)
        .bind(&search_pattern)
        .bind(&search_pattern)
        .bind(filters.hide_incomplete)
        .bind(filters.hide_complete)
        .bind(filters.hide_favorite)
        .bind(filters.hide_non_favorite)
        .bind(filters.favorite_first)
        .bind(limit)
        .bind(offset)
        .fetch_all(&*pool).await;

    tasks.map_err(|e| e.to_string())
}
