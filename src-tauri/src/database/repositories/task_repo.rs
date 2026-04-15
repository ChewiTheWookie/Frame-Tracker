use crate::models::database::filters::TaskFilters;
use crate::models::database::stats::TaskStats;
use crate::models::database::task::Task;
use sqlx::{ Pool, Sqlite };

pub async fn get_stats(pool: &Pool<Sqlite>, category: &str) -> Result<TaskStats, sqlx::Error> {
    let row = sqlx
        ::query_as::<_, (i32, i32)>(
            r#"
        SELECT 
            COUNT(*), 
            CAST(COALESCE(SUM(current_completions >= max_completions), 0) AS INTEGER) 
        FROM task_tracker 
        WHERE (category = ? OR ? = 'All')
        "#
        )
        .bind(category)
        .bind(category)
        .fetch_one(pool).await?;

    Ok(TaskStats {
        current: row.1,
        total: row.0,
    })
}

pub async fn find_all(
    pool: &Pool<Sqlite>,
    category: &str,
    search: &str,
    filters: &TaskFilters,
    limit: i64,
    offset: i64
) -> Result<Vec<Task>, sqlx::Error> {
    let search_pattern = format!("%{}%", search);

    sqlx
        ::query_as::<_, Task>(
            r#"
        SELECT * FROM task_tracker 
        WHERE (category = ? OR ? = 'All')
        AND (name LIKE ? OR tags LIKE ? OR location LIKE ?)
        AND (NOT (? AND current_completions < max_completions))
        AND (NOT (? AND current_completions >= max_completions))
        AND (NOT (? AND favorite = 1))
        AND (NOT (? AND favorite = 0))
        ORDER BY 
            -- Sort by favorite if the filter is active, then by name
            CASE WHEN ? THEN favorite END DESC, 
            name ASC
        LIMIT ? OFFSET ?
        "#
        )
        .bind(category)
        .bind(category)
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
        .fetch_all(pool).await
}

pub async fn find_by_id(pool: &Pool<Sqlite>, id: &str) -> Result<Task, sqlx::Error> {
    sqlx
        ::query_as::<_, Task>("SELECT * FROM task_tracker WHERE id = ?")
        .bind(id)
        .fetch_one(pool).await
}

pub async fn set_favorite_status(
    pool: &Pool<Sqlite>,
    id: &str,
    is_favorite: bool
) -> Result<(), sqlx::Error> {
    sqlx
        ::query("UPDATE task_tracker SET favorite = ? WHERE id = ?")
        .bind(is_favorite)
        .bind(id)
        .execute(pool).await?;

    Ok(())
}

pub async fn update_completions(
    pool: &Pool<Sqlite>,
    id: &str,
    count: i32,
    reset_time: String
) -> Result<Task, sqlx::Error> {
    sqlx
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
        .bind(reset_time)
        .bind(id)
        .fetch_one(pool).await
}

pub async fn find_all_raw(pool: &Pool<Sqlite>) -> Result<Vec<Task>, sqlx::Error> {
    sqlx::query_as::<_, Task>("SELECT * FROM task_tracker").fetch_all(pool).await
}

pub async fn reset_task_progress(
    pool: &Pool<Sqlite>,
    id: &str,
    reset_time: String
) -> Result<u64, sqlx::Error> {
    let res = sqlx
        ::query("UPDATE task_tracker SET current_completions = 0, last_reset = ? WHERE id = ?")
        .bind(reset_time)
        .bind(id)
        .execute(pool).await?;

    Ok(res.rows_affected())
}
