use crate::database::repositories::task_repo;
use chrono::{ DateTime, Datelike, Duration, NaiveDateTime, TimeZone, Utc };
use sqlx::SqlitePool;
use tauri::{ AppHandle, Emitter };

pub async fn check_and_apply_resets(
    pool: &SqlitePool,
    handle: &AppHandle
) -> Result<(), sqlx::Error> {
    let tasks = task_repo::find_all_raw(pool).await?;

    let mut rows_affected = 0;

    for task in tasks {
        let interval_str = task.reset_interval.as_deref().unwrap_or("Daily");

        let last_reset_dt = parse_last_reset(&task.last_reset);
        let current_period_start = get_current_period_start(interval_str);

        let mut should_reset = last_reset_dt < current_period_start;

        if is_custom_interval(interval_str) {
            if let Some(duration) = parse_custom_interval(interval_str) {
                should_reset = Utc::now() >= last_reset_dt + duration;
            }
        }

        if should_reset {
            let affected = task_repo::reset_task_progress(
                pool,
                &task.id,
                current_period_start.to_rfc3339()
            ).await?;

            rows_affected += affected;
        }
    }

    if rows_affected > 0 {
        let _ = handle.emit("tasks-reset", "reset_triggered").map_err(|e| {
            eprintln!(">>> [BACKEND] Emit FAILED: {:?}", e);
        });
    }

    Ok(())
}

fn parse_last_reset(last_reset: &str) -> DateTime<Utc> {
    if let Ok(dt) = DateTime::parse_from_rfc3339(last_reset) {
        return dt.with_timezone(&Utc);
    }

    if let Ok(ndt) = NaiveDateTime::parse_from_str(last_reset, "%Y-%m-%d %H:%M:%S") {
        return ndt.and_utc();
    }

    if
        let Ok(ndt) = NaiveDateTime::parse_from_str(
            &format!("{} 00:00:00", last_reset),
            "%Y-%m-%d %H:%M:%S"
        )
    {
        return ndt.and_utc();
    }

    Utc.timestamp_opt(0, 0).unwrap()
}

fn is_custom_interval(interval: &str) -> bool {
    let lower = interval.to_lowercase();
    !matches!(lower.as_str(), "daily" | "weekly" | "baro") && !lower.ends_with("_world")
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

            let elapsed = now.timestamp() - anchor_ts;
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

pub fn calculate_rolling_reset(interval: &str) -> DateTime<Utc> {
    let now = Utc::now();

    if interval.ends_with('h') {
        if let Ok(hours) = interval.trim_end_matches('h').parse::<i64>() {
            return now - Duration::hours(hours);
        }
    }

    now - Duration::days(1)
}
