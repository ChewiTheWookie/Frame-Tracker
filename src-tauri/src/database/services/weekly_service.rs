use crate::models::weekly_tracker::tasks::{ WeeklyTask };
use sqlx::SqlitePool;
use chrono::{ DateTime, Utc, Datelike, Duration };

fn is_past_monday_reset(last_reset: &DateTime<Utc>, now: &DateTime<Utc>) -> bool {
    let days_since_last = now.signed_duration_since(*last_reset).num_days();
    if days_since_last >= 7 {
        return true;
    }

    let last_weekday = last_reset.weekday().num_days_from_monday();
    let now_weekday = now.weekday().num_days_from_monday();

    days_since_last > 0 && now_weekday < last_weekday
}

fn check_custom_interval(last_reset: &DateTime<Utc>, interval: &str, now: &DateTime<Utc>) -> bool {
    let unit = interval.chars().last().unwrap_or(' ');
    let value = interval[..interval.len() - 1].parse::<i64>().unwrap_or(0);

    let duration = match unit {
        'm' => Duration::minutes(value),
        'h' => Duration::hours(value),
        'd' => Duration::days(value),
        _ => Duration::zero(),
    };

    *now >= *last_reset + duration
}

pub async fn get_all_weekly_tasks(pool: &SqlitePool) -> Result<Vec<WeeklyTask>, sqlx::Error> {
    let mut tasks = sqlx
        ::query_as::<_, WeeklyTask>(
            "SELECT id, name, category, current_completions, max_completions, last_reset, tags, reset_interval FROM weekly_tasks"
        )
        .fetch_all(pool).await?;

    let now = Utc::now();
    let mut tx = pool.begin().await?;

    for task in &mut tasks {
        let last_reset = DateTime::parse_from_rfc3339(&task.last_reset)
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or(now);

        let should_reset = match task.category.as_str() {
            "Daily" => {
                if let Some(interval) = &task.reset_interval {
                    check_custom_interval(&last_reset, interval, &now)
                } else {
                    now.date_naive() > last_reset.date_naive()
                }
            }
            "Weekly" => {
                if let Some(interval) = &task.reset_interval {
                    check_custom_interval(&last_reset, interval, &now)
                } else {
                    is_past_monday_reset(&last_reset, &now)
                }
            }
            "Other" => {
                if let Some(interval) = &task.reset_interval {
                    check_custom_interval(&last_reset, interval, &now)
                } else {
                    false
                }
            }
            _ => false,
        };

        if should_reset {
            task.current_completions = 0;
            task.last_reset = now.to_rfc3339();

            sqlx
                ::query(
                    "UPDATE weekly_tasks SET current_completions = 0, last_reset = ? WHERE id = ?"
                )
                .bind(&task.last_reset)
                .bind(&task.id)
                .execute(&mut *tx).await?;
        }
    }

    tx.commit().await?;
    Ok(tasks)
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
