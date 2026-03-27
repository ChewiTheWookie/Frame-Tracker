use crate::models::database::task::Task;
use chrono::{ DateTime, Datelike, Duration, NaiveDateTime, TimeZone, Utc };
use sqlx::SqlitePool;
use tauri::{ AppHandle, Emitter };

pub async fn check_and_apply_resets(
    pool: &SqlitePool,
    handle: &AppHandle
) -> Result<(), sqlx::Error> {
    let mut rows_affected = 0;

    let tasks = sqlx::query_as::<_, Task>("SELECT * FROM task_tracker").fetch_all(pool).await?;

    for task in tasks {
        let interval_str = task.reset_interval.as_deref().unwrap_or("Daily");
        let mut should_reset = false;

        let last_reset_dt = DateTime::parse_from_rfc3339(&task.last_reset)
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(|_| {
                NaiveDateTime::parse_from_str(&task.last_reset, "%Y-%m-%d %H:%M:%S")
                    .map(|ndt| ndt.and_utc())
                    .unwrap_or_else(|_| {
                        NaiveDateTime::parse_from_str(
                            &format!("{} 00:00:00", task.last_reset),
                            "%Y-%m-%d %H:%M:%S"
                        )
                            .map(|ndt| ndt.and_utc())
                            .unwrap_or_else(|_| Utc.timestamp_opt(0, 0).unwrap())
                    })
            });

        let current_period_start = get_current_period_start(interval_str);

        if last_reset_dt < current_period_start {
            should_reset = true;
        }

        if
            !["daily", "weekly", "baro"].contains(&interval_str.to_lowercase().as_str()) &&
            !interval_str.ends_with("_world")
        {
            if let Some(duration) = parse_custom_interval(interval_str) {
                if Utc::now() >= last_reset_dt + duration {
                    should_reset = true;
                } else {
                    should_reset = false;
                }
            }
        }

        if should_reset {
            let res = sqlx
                ::query(
                    "UPDATE task_tracker SET current_completions = 0, last_reset = ? WHERE id = ?"
                )
                .bind(current_period_start.to_rfc3339())
                .bind(&task.id)
                .execute(pool).await?;

            rows_affected += res.rows_affected();
        }
    }

    if rows_affected > 0 {
        if let Err(e) = handle.emit("tasks-reset", "reset_triggered") {
            eprintln!(">>> [BACKEND] Emit FAILED: {:?}", e);
        }
    }

    Ok(())
}

fn parse_custom_interval(interval: &str) -> Option<Duration> {
    if interval.len() < 2 {
        return None;
    }
    let (value_str, suffix) = interval.split_at(interval.len() - 1);
    let value = value_str.parse::<i64>().ok()?;

    match suffix {
        "d" => Some(Duration::days(value)),
        "h" => Some(Duration::hours(value)),
        "m" => Some(Duration::minutes(value)),
        _ => None,
    }
}

pub fn get_current_period_start(interval: &str) -> DateTime<Utc> {
    let now = Utc::now();
    let interval_lower = interval.to_lowercase();

    match interval_lower.as_str() {
        i if i.starts_with("daily") => {
            let hour: u32 = i
                .split('_')
                .nth(1)
                .and_then(|s| s.parse().ok())
                .unwrap_or(0);

            let mut reset_time = Utc.with_ymd_and_hms(
                now.year(),
                now.month(),
                now.day(),
                hour,
                0,
                0
            ).unwrap();

            if now < reset_time {
                reset_time = reset_time - Duration::days(1);
            }
            reset_time
        }
        "weekly" => {
            let days_since_monday = now.weekday().num_days_from_monday();
            Utc.with_ymd_and_hms(now.year(), now.month(), now.day(), 0, 0, 0).unwrap() -
                Duration::days(days_since_monday as i64)
        }
        "baro" => {
            let anchor_ts = 1772802000;
            let interval_secs = 14 * 24 * 60 * 60;

            let now_ts = now.timestamp();
            let elapsed = now_ts - anchor_ts;
            let current_cycle_start = anchor_ts + (elapsed / interval_secs) * interval_secs;

            Utc.timestamp_opt(current_cycle_start, 0).unwrap()
        }
        i if i.ends_with("_world") => {
            let duration_part = i.replace("_world", "");
            if let Some(duration) = parse_custom_interval(&duration_part) {
                let secs = duration.num_seconds();
                let current_bucket = (now.timestamp() / secs) * secs;
                Utc.timestamp_opt(current_bucket, 0).unwrap()
            } else {
                now
            }
        }
        _ => now,
    }
}

pub fn calculate_rolling_reset(interval: &str) -> chrono::DateTime<chrono::Utc> {
    let now = chrono::Utc::now();

    if interval.ends_with('h') {
        if let Ok(hours) = interval.trim_end_matches('h').parse::<i64>() {
            return now - chrono::Duration::hours(hours);
        }
    }

    now - chrono::Duration::days(1)
}
