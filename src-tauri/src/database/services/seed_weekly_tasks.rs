use crate::models::weekly_tracker::tasks::DEFAULT_WEEKLY_TASKS;
use sqlx::sqlite::SqlitePool;

pub async fn seed_weekly_tasks(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    for (id, name, cat, curr, max) in DEFAULT_WEEKLY_TASKS {
        sqlx
            ::query(
                "INSERT INTO weekly_tasks (id, name, category, current_completions, max_completions, last_reset)
             VALUES (?, ?, ?, ?, ?, datetime('now'))
             ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                category = excluded.category,
                max_completions = excluded.max_completions"
            )
            .bind(id)
            .bind(name)
            .bind(cat)
            .bind(curr)
            .bind(max)
            .execute(pool).await?;
    }
    Ok(())
}
