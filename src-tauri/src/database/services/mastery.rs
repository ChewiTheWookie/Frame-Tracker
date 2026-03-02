use sqlx::{ sqlite::SqlitePool, Row };
use std::collections::HashMap;
use crate::database::db::DbUserProgress;

pub async fn save_progress(
    pool: &SqlitePool,
    id: &str,
    progress: &DbUserProgress
) -> Result<(), sqlx::Error> {
    let parts_json = serde_json::to_string(&progress.parts).unwrap_or_else(|_| "{}".to_string());

    sqlx
        ::query(
            "INSERT INTO mastery_tracker (id, mastered, helminthed, owned, craftable, parts_json)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(id) DO UPDATE SET
            mastered = excluded.mastered,
            helminthed = excluded.helminthed,
            owned = excluded.owned,
            craftable = excluded.craftable,
            parts_json = excluded.parts_json"
        )
        .bind(id)
        .bind(progress.mastered)
        .bind(progress.helminthed)
        .bind(progress.owned)
        .bind(progress.craftable)
        .bind(parts_json)
        .execute(pool).await?;

    Ok(())
}

pub async fn fetch_all_progress(
    pool: &SqlitePool
) -> Result<HashMap<String, DbUserProgress>, sqlx::Error> {
    let rows = sqlx::query("SELECT * FROM mastery_tracker").fetch_all(pool).await?;

    let mut results = HashMap::new();

    for row in rows {
        let id: String = row.get("id");
        let parts_json: String = row.get("parts_json");
        let parts = serde_json::from_str(&parts_json).unwrap_or_default();

        results.insert(id, DbUserProgress {
            mastered: row.get("mastered"),
            helminthed: row.get("helminthed"),
            owned: row.get("owned"),
            craftable: row.get("craftable"),
            parts,
        });
    }

    Ok(results)
}
