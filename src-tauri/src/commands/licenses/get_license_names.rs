use crate::database::db::LicenseDb;
use crate::models::database::license::LicenseSummary;
use tauri::State;
use tauri_plugin_log::log::{ debug, error };

#[tauri::command]
pub async fn get_license_names(
    state: State<'_, LicenseDb>,
    search: String,
    limit: i64,
    offset: i64
) -> Result<Vec<LicenseSummary>, String> {
    debug!(
        "get_license_names called | search: '{}' | limit: {} | offset: {}",
        search,
        limit,
        offset
    );

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
        .map_err(|e| {
            let err_msg = format!("Database error fetching license list: {}", e);
            error!("{}", err_msg);
            err_msg
        })?;

    debug!("Retrieved {} licenses from database", licenses.len());
    Ok(licenses)
}
