use sqlx::{ Pool, Sqlite };

pub async fn run_relational_migration(
    pool: &Pool<Sqlite>
) -> Result<(), Box<dyn std::error::Error>> {
    let source_table = if check_column(pool, "mastery_tracker_backup", "parts_json").await {
        "mastery_tracker_backup"
    } else if check_column(pool, "mastery_tracker", "parts_json").await {
        "mastery_tracker"
    } else {
        return Ok(());
    };

    let query_str = format!("SELECT id, parts_json FROM {}", source_table);
    let old_data: Vec<(String, String)> = sqlx::query_as(&query_str).fetch_all(pool).await?;

    for (item_id, mut json_str) in old_data {
        json_str = json_str.replace("\"\"", "\"");

        let parts: std::collections::HashMap<String, bool> = match serde_json::from_str(&json_str) {
            Ok(p) => p,
            Err(_) => {
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
    }

    sqlx::query("DROP TABLE IF EXISTS mastery_tracker_backup").execute(pool).await?;

    Ok(())
}

async fn check_column(pool: &Pool<Sqlite>, table: &str, col: &str) -> bool {
    let q = format!("PRAGMA table_info({})", table);
    let rows: Vec<(i64, String, String, i64, Option<String>, i64)> = sqlx
        ::query_as(&q)
        .fetch_all(pool).await
        .unwrap_or_default();

    rows.iter().any(|r| r.1 == col)
}
