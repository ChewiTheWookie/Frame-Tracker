use crate::database::db::LicenseDb;
use crate::models::database::license::LicenseDetails;
use tauri::State;
use tauri_plugin_log::log::{ debug, error };

#[tauri::command]
pub async fn get_license_details(
    id: String,
    state: State<'_, LicenseDb>
) -> Result<LicenseDetails, String> {
    debug!("get_license_details called for ID: {}", id);

    let pool = &state.0;

    let details = sqlx
        ::query_as::<sqlx::Sqlite, LicenseDetails>(
            "SELECT id, license_text, repository, author FROM licenses WHERE id = $1"
        )
        .bind(&id)
        .fetch_one(pool).await
        .map_err(|e| {
            let err_msg = format!("Failed to fetch license details for '{}': {}", id, e);
            error!("{}", err_msg);
            err_msg
        })?;

    debug!("Successfully retrieved license details for: {}", id);
    Ok(details)
}
