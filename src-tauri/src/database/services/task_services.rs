use crate::database::repositories::task_repo;
use chrono::{ DateTime, Datelike, Duration, NaiveDateTime, TimeZone, Utc };
use sqlx::SqlitePool;
use tauri::{ AppHandle, Emitter };
use tauri_plugin_log::log::{ debug, error, info, warn };

pub enum ResetType {
    Daily(u32),
    Weekly,
    Baro,
    World(Duration),
    Custom(Duration),
}

impl ResetType {
    pub fn from_str(s: &str) -> Self {
        let s = s.to_lowercase();

        if s.starts_with("daily") {
            let hour = s
                .split('_')
                .nth(1)
                .and_then(|h| h.parse().ok())
                .unwrap_or(0);
            return Self::Daily(hour);
        }

        if s.ends_with("_world") {
            let dur = parse_duration_str(&s.replace("_world", "")).unwrap_or(Duration::zero());
            return Self::World(dur);
        }

        match s.as_str() {
            "weekly" => Self::Weekly,
            "baro" => Self::Baro,
            _ => {
                if let Some(dur) = parse_duration_str(&s) {
                    Self::Custom(dur)
                } else {
                    Self::Daily(0)
                }
            }
        }
    }
}

pub async fn check_and_apply_resets(
    pool: &SqlitePool,
    handle: &AppHandle
) -> Result<(), sqlx::Error> {
    debug!("Checking for task resets...");
    let tasks = task_repo::find_all_raw(pool).await?;
    let mut rows_affected = 0;
    let now = Utc::now();

    for task in tasks {
        let interval_str = task.reset_interval.as_deref().unwrap_or("Daily");
        let reset_type = ResetType::from_str(interval_str);

        let last_reset_dt = parse_last_reset(&task.last_reset);
        let current_period_start = get_period_start(&reset_type, now);

        let should_reset = match reset_type {
            ResetType::Custom(duration) => now >= last_reset_dt + duration,
            _ => last_reset_dt < current_period_start,
        };

        if should_reset {
            debug!("Resetting task: {} (Last: {})", task.name, task.last_reset);
            let affected = task_repo::reset_task_progress(
                pool,
                &task.id,
                current_period_start.to_rfc3339()
            ).await?;

            rows_affected += affected;
        }
    }

    if rows_affected > 0 {
        info!("Applied resets to {} task(s)", rows_affected);
        if let Err(e) = handle.emit("tasks-reset", "reset_triggered") {
            error!("Failed to emit tasks-reset event: {:?}", e);
        }
    }

    Ok(())
}

pub fn get_period_start(reset_type: &ResetType, now: DateTime<Utc>) -> DateTime<Utc> {
    match reset_type {
        ResetType::Daily(hour) => {
            let mut reset = now.date_naive().and_hms_opt(*hour, 0, 0).unwrap().and_utc();

            if now < reset {
                reset -= Duration::days(1);
            }
            reset
        }
        ResetType::Weekly => {
            let days_since_monday = now.weekday().num_days_from_monday();
            (now - Duration::days(days_since_monday as i64))
                .date_naive()
                .and_hms_opt(0, 0, 0)
                .unwrap()
                .and_utc()
        }
        ResetType::Baro => {
            let anchor_ts = 1772802000;
            let interval_secs = 14 * 24 * 60 * 60;
            let elapsed = now.timestamp() - anchor_ts;
            let current_cycle_start = anchor_ts + (elapsed / interval_secs) * interval_secs;
            Utc.timestamp_opt(current_cycle_start, 0).unwrap()
        }
        ResetType::World(duration) | ResetType::Custom(duration) => {
            let secs = duration.num_seconds();
            if secs == 0 {
                return now;
            }
            let current_bucket = (now.timestamp() / secs) * secs;
            Utc.timestamp_opt(current_bucket, 0).unwrap()
        }
    }
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

    warn!("Failed to parse last_reset date: '{}'. Defaulting to epoch 0.", last_reset);
    Utc.timestamp_opt(0, 0).unwrap()
}

fn parse_duration_str(interval: &str) -> Option<Duration> {
    if interval.len() < 2 {
        return None;
    }

    let (value_str, suffix) = interval.split_at(interval.len() - 1);
    let value = value_str.parse::<i64>().ok()?;

    match suffix {
        "d" => Some(Duration::days(value)),
        "h" => Some(Duration::hours(value)),
        "m" => Some(Duration::minutes(value)),
        _ => {
            debug!("Unknown duration suffix: {}", suffix);
            None
        }
    }
}

pub fn calculate_rolling_reset(interval: &str) -> DateTime<Utc> {
    let now = Utc::now();
    if let Some(duration) = parse_duration_str(interval) {
        return now - duration;
    }
    now - Duration::days(1)
}
