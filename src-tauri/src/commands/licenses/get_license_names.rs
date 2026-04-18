use crate::database::db::LicenseDb;
use crate::models::database::license::LicenseSummary;
use tauri::State;

#[tauri::command]
pub async fn get_license_names(state: State<'_, LicenseDb>) -> Result<Vec<LicenseSummary>, String> {
    let pool = &state.0;

    let licenses = sqlx
        ::query_as::<sqlx::Sqlite, LicenseSummary>(
            "SELECT id, name, version, source FROM licenses ORDER BY id ASC"
        )
        .fetch_all(pool).await
        .map_err(|e| e.to_string())?;

    Ok(licenses)
}
