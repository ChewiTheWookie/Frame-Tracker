use crate::database::db::{ DbState, DbUserProgress };
use tauri::State;
use std::collections::HashMap;
use sqlx::Row;

#[tauri::command]
pub async fn save_item_progress(
    id: String,
    progress: DbUserProgress,
    state: State<'_, DbState>
) -> Result<(), String> {
    let parts_json = serde_json::to_string(&progress.parts).map_err(|e| e.to_string())?;

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
        .execute(&state.pool).await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_all_user_progress(
    state: State<'_, DbState>
) -> Result<HashMap<String, DbUserProgress>, String> {
    let rows = sqlx
        ::query("SELECT * FROM mastery_tracker")
        .fetch_all(&state.pool).await
        .map_err(|e| e.to_string())?;

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
