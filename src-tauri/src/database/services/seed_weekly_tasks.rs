use crate::models::weekly_tracker::tasks::DEFAULT_WEEKLY_TASKS;
use sqlx::sqlite::SqlitePool;

pub async fn seed_weekly_tasks(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    for (id, name, cat, curr, max, tags, interval, loc, term, quest, icon) in DEFAULT_WEEKLY_TASKS {
        sqlx
            ::query(
                "INSERT INTO weekly_tasks (id, name, category, current_completions, max_completions, last_reset, tags, reset_interval, location, terminal, quest_required, icon)
         VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            location = excluded.location,
            terminal = excluded.terminal,
            quest_required = excluded.quest_required,
            icon = excluded.icon"
            )
            .bind(id)
            .bind(name)
            .bind(cat)
            .bind(curr)
            .bind(max)
            .bind(tags)
            .bind(interval)
            .bind(loc)
            .bind(term)
            .bind(quest)
            .bind(icon)
            .execute(pool).await?;
    }
    Ok(())
}
