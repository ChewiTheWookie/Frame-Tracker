use crate::{
    database::repositories::task_builder::TaskQueryBuilder,
    models::database::filters::TaskFilters,
};
use crate::models::database::stats::TaskStats;
use crate::models::database::task::Task;
use sqlx::{ Pool, Sqlite };
use tauri_plugin_log::log::{ debug, error, info };

pub async fn get_stats(
    pool: &Pool<Sqlite>,
    category: &str,
    filters: &TaskFilters
) -> Result<TaskStats, sqlx::Error> {
    debug!("get_stats | Category: {}", category);

    let row: (i32, i32) = TaskQueryBuilder::new(category, "", filters)
        .build_stats()
        .build_query_as::<(i32, i32)>()
        .fetch_one(pool).await
        .map_err(|e| {
            error!("Failed to fetch task stats: {}", e);
            e
        })?;

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
    debug!("find_all | Category: {} | Search: '{}'", category, search);

    TaskQueryBuilder::new(category, search, filters)
        .paginate(limit, offset)
        .build()
        .build_query_as::<Task>()
        .fetch_all(pool).await
}

pub async fn find_by_id(pool: &Pool<Sqlite>, id: &str) -> Result<Task, sqlx::Error> {
    debug!("find_by_id | ID: {}", id);

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
    debug!("set_favorite_status | ID: {} | Favorite: {}", id, is_favorite);

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
    debug!("update_completions | ID: {} | Count: {} | Reset: {}", id, count, reset_time);

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
    debug!("find_all_raw | Fetching all tasks without filters");
    sqlx::query_as::<_, Task>("SELECT * FROM task_tracker").fetch_all(pool).await
}

pub async fn reset_task_progress(
    pool: &Pool<Sqlite>,
    id: &str,
    reset_time: String
) -> Result<u64, sqlx::Error> {
    info!("reset_task_progress | Resetting ID: {} | New Time: {}", id, reset_time);

    let res = sqlx
        ::query("UPDATE task_tracker SET current_completions = 0, last_reset = ? WHERE id = ?")
        .bind(reset_time)
        .bind(id)
        .execute(pool).await?;

    Ok(res.rows_affected())
}
