use sqlx::sqlite::SqlitePool;
use serde::{ Deserialize, Serialize };

pub struct DbState {
    pub pool: SqlitePool,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DbUserProgress {
    pub mastered: bool,
    pub helminthed: bool,
    pub owned: bool,
    pub craftable: bool,
    pub parts: std::collections::HashMap<String, bool>,
}

pub async fn init_db(app_data_dir: std::path::PathBuf) -> SqlitePool {
    let db_path = app_data_dir.join("frametracker.db");
    let connection_str = format!("sqlite:{}?mode=rwc", db_path.to_string_lossy());

    let pool = SqlitePool::connect(&connection_str).await.expect("Failed to connect to LL");

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS mastery_tracker (
            id TEXT PRIMARY KEY,
            mastered BOOLEAN NOT NULL DEFAULT 0,
            helminthed BOOLEAN NOT NULL DEFAULT 0,
            owned BOOLEAN NOT NULL DEFAULT 0,
            craftable BOOLEAN NOT NULL DEFAULT 0,
            parts_json TEXT NOT NULL
        )"
    )
        .execute(&pool).await
        .unwrap();

    pool
}
