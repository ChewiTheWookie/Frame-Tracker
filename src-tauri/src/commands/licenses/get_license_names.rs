use crate::database::db::LicenseDb;
use crate::models::database::license::LicenseSummary;
use tauri::State;

#[tauri::command]
pub async fn get_license_names(
    state: State<'_, LicenseDb>,
    search: String,
    limit: i64,
    offset: i64
) -> Result<Vec<LicenseSummary>, String> {
    let pool = &state.0;

    let search_pattern = format!("%{}%", search);

    let licenses = sqlx
        ::query_as::<sqlx::Sqlite, LicenseSummary>(
            "SELECT id, name, version, source 
         FROM licenses 
         WHERE id LIKE ? 
         ORDER BY id ASC 
         LIMIT ? OFFSET ?"
        )
        .bind(search_pattern)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool).await
        .map_err(|e| e.to_string())?;

    Ok(licenses)
}
