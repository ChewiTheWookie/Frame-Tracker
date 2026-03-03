use crate::models::weekly_tracker::tasks::{ WeeklyTask };
use sqlx::SqlitePool;

pub async fn get_all_weekly_tasks(pool: &SqlitePool) -> Result<Vec<WeeklyTask>, sqlx::Error> {
    sqlx
        ::query_as::<_, WeeklyTask>(
            "SELECT id, name, category, current_completions, max_completions, last_reset FROM weekly_tasks"
        )
        .fetch_all(pool).await
}

pub async fn adjust_weekly_task(
    pool: &SqlitePool,
    id: &str,
    is_increment: bool
) -> Result<(), sqlx::Error> {
    let mut tx = pool.begin().await?;

    if id == "deep_archimedea" {
        let new_val = if is_increment { 1 } else { 0 };
        sqlx
            ::query("UPDATE weekly_tasks SET current_completions = ? WHERE id = 'deep_archimedea'")
            .bind(new_val)
            .execute(&mut *tx).await?;

        let pulse_change = if is_increment { 2 } else { -2 };
        sqlx
            ::query(
                "UPDATE weekly_tasks 
             SET current_completions = CASE 
                WHEN ? > 0 THEN MIN(max_completions, current_completions + ?)
                ELSE MAX(0, current_completions + ?)
             END 
             WHERE id = 'netracells'"
            )
            .bind(pulse_change)
            .bind(pulse_change)
            .bind(pulse_change)
            .execute(&mut *tx).await?;
    } else if id == "netracells" && !is_increment {
        let da_status: (i32,) = sqlx
            ::query_as("SELECT current_completions FROM weekly_tasks WHERE id = 'deep_archimedea'")
            .fetch_one(&mut *tx).await?;

        let floor = if da_status.0 > 0 { 2 } else { 0 };

        sqlx
            ::query(
                "UPDATE weekly_tasks 
             SET current_completions = MAX(?, current_completions - 1) 
             WHERE id = 'netracells'"
            )
            .bind(floor)
            .execute(&mut *tx).await?;
    } else {
        let amount = if is_increment { 1 } else { -1 };
        sqlx
            ::query(
                "UPDATE weekly_tasks 
             SET current_completions = CASE 
                WHEN ? > 0 THEN MIN(max_completions, current_completions + ?)
                ELSE MAX(0, current_completions + ?)
             END 
             WHERE id = ?"
            )
            .bind(amount)
            .bind(amount)
            .bind(amount)
            .bind(id)
            .execute(&mut *tx).await?;
    }

    tx.commit().await?;
    Ok(())
}
