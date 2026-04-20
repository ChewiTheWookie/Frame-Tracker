use sqlx::{ Pool, Sqlite };
use tauri_plugin_log::log::{ debug, error, info, warn };

pub async fn run_relational_migration(
    pool: &Pool<Sqlite>
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Starting relational migration for component data");

    let source_table = if check_column(pool, "mastery_tracker_backup", "parts_json").await {
        "mastery_tracker_backup"
    } else if check_column(pool, "mastery_tracker", "parts_json").await {
        "mastery_tracker"
    } else {
        debug!("No migration source found with 'parts_json' column. Skipping.");
        return Ok(());
    };

    info!("Migrating data from source table: {}", source_table);

    let query_str = format!("SELECT id, parts_json FROM {}", source_table);
    let old_data: Vec<(String, String)> = sqlx
        ::query_as(&query_str)
        .fetch_all(pool).await
        .map_err(|e| {
            error!("Failed to fetch legacy data from {}: {}", source_table, e);
            e
        })?;

    let total_records = old_data.len();
    let mut migrated_count = 0;

    for (item_id, mut json_str) in old_data {
        json_str = json_str.replace("\"\"", "\"");

        let parts: std::collections::HashMap<String, bool> = match serde_json::from_str(&json_str) {
            Ok(p) => p,
            Err(e) => {
                warn!("Skipping invalid JSON for item {}: {}", item_id, e);
                continue;
            }
        };

        for (name, is_obtained) in parts {
            let owned = if is_obtained { 1 } else { 0 };

            sqlx
                ::query(
                    "INSERT OR REPLACE INTO item_components (item_id, component_name, needed_quantity, owned_quantity) 
                 VALUES (?, ?, 1, ?)"
                )
                .bind(&item_id)
                .bind(&name)
                .bind(owned)
                .execute(pool).await?;
        }
        migrated_count += 1;
    }

    info!("Successfully migrated {}/{} records", migrated_count, total_records);

    debug!("Cleaning up legacy backup table if exists");
    sqlx::query("DROP TABLE IF EXISTS mastery_tracker_backup").execute(pool).await?;

    info!("Relational migration completed");

    Ok(())
}

async fn check_column(pool: &Pool<Sqlite>, table: &str, col: &str) -> bool {
    let q = format!("PRAGMA table_info({})", table);
    let rows: Vec<(i64, String, String, i64, Option<String>, i64)> = sqlx
        ::query_as(&q)
        .fetch_all(pool).await
        .unwrap_or_default();

    let exists = rows.iter().any(|r| r.1 == col);
    debug!("Column check | Table: {} | Column: {} | Exists: {}", table, col, exists);

    exists
}
