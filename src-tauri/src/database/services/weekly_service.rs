use crate::models::weekly_tracker::tasks::{ WeeklyTask };
use sqlx::SqlitePool;
use chrono::{ DateTime, Utc, Datelike, Duration, Timelike };

fn is_past_monday_reset(last_reset: &DateTime<Utc>, now: &DateTime<Utc>) -> bool {
    if now.signed_duration_since(*last_reset).num_days() >= 7 {
        return true;
    }

    now.iso_week() != last_reset.iso_week()
}

fn check_custom_interval(last_reset: &DateTime<Utc>, interval: &str, now: &DateTime<Utc>) -> bool {
    if interval == "8h_world" {
        let current_hour = now.hour();
        let last_boundary_hour = (current_hour / 8) * 8;

        let last_boundary = now
            .date_naive()
            .and_hms_opt(last_boundary_hour, 0, 0)
            .unwrap()
            .and_local_timezone(Utc)
            .unwrap();

        return last_reset < &last_boundary;
    }

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
        ::query_as::<_, WeeklyTask>("SELECT * FROM weekly_tasks")
        .fetch_all(pool).await?;

    let now = Utc::now();
    let mut tx = pool.begin().await?;

    for task in &mut tasks {
        let last_reset = DateTime::parse_from_rfc3339(&task.last_reset)
            .map(|dt| dt.with_timezone(&Utc))
            .or_else(|_| {
                chrono::NaiveDateTime
                    ::parse_from_str(&task.last_reset, "%Y-%m-%d %H:%M:%S")
                    .map(|dt| dt.and_utc())
            })
            .unwrap_or_else(|_| DateTime::from_timestamp(0, 0).unwrap().with_timezone(&Utc));

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

    let archimedea_ids = ["deep_archimedea", "elite_deep_archimedea", "elite_temporal_archimedea"];

    if archimedea_ids.contains(&id.as_ref()) {
        let active_archimedea: Option<(String,)> = sqlx
            ::query_as(
                "SELECT id FROM weekly_tasks WHERE id IN ('deep_archimedea', 'elite_deep_archimedea', 'elite_temporal_archimedea') AND current_completions > 0"
            )
            .fetch_optional(&mut *tx).await?;

        let was_any_active = active_archimedea.is_some();
        let active_id = active_archimedea.map(|(s,)| s);

        if is_increment {
            if active_id.as_deref() != Some(id) {
                if !was_any_active {
                    let netracells: (i32, i32) = sqlx
                        ::query_as(
                            "SELECT current_completions, max_completions FROM weekly_tasks WHERE id = 'netracells'"
                        )
                        .fetch_one(&mut *tx).await?;

                    if netracells.0 >= netracells.1 - 1 {
                        return Ok(());
                    }
                }

                sqlx
                    ::query("UPDATE weekly_tasks SET current_completions = 1 WHERE id = ?")
                    .bind(id)
                    .execute(&mut *tx).await?;

                for other_id in archimedea_ids.iter().filter(|&&x| x != id) {
                    sqlx
                        ::query("UPDATE weekly_tasks SET current_completions = 0 WHERE id = ?")
                        .bind(other_id)
                        .execute(&mut *tx).await?;
                }

                if !was_any_active {
                    sqlx
                        ::query(
                            "UPDATE weekly_tasks SET current_completions = MIN(max_completions, current_completions + 2) WHERE id = 'netracells'"
                        )
                        .execute(&mut *tx).await?;
                }
            }
        } else {
            if active_id.as_deref() == Some(id) {
                sqlx
                    ::query("UPDATE weekly_tasks SET current_completions = 0 WHERE id = ?")
                    .bind(id)
                    .execute(&mut *tx).await?;

                sqlx
                    ::query(
                        "UPDATE weekly_tasks SET current_completions = MAX(0, current_completions - 2) WHERE id = 'netracells'"
                    )
                    .execute(&mut *tx).await?;
            }
        }
    } else if id == "netracells" {
        let any_da_active: (i32,) = sqlx
            ::query_as(
                "SELECT COUNT(*) FROM weekly_tasks WHERE id IN ('deep_archimedea', 'elite_deep_archimedea', 'elite_temporal_archimedea') AND current_completions > 0"
            )
            .fetch_one(&mut *tx).await?;

        let floor = if any_da_active.0 > 0 { 2 } else { 0 };
        let amount = if is_increment { 1 } else { -1 };

        sqlx
            ::query(
                "UPDATE weekly_tasks 
             SET current_completions = CASE 
                WHEN ? > 0 THEN MIN(max_completions, current_completions + ?)
                ELSE MAX(?, current_completions + ?)
             END 
             WHERE id = 'netracells'"
            )
            .bind(amount)
            .bind(amount)
            .bind(floor)
            .bind(amount)
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
