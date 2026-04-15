use crate::database::db::LicenseDb;
use crate::models::database::license::LicenseDetails;
use tauri::State;

#[tauri::command]
pub async fn get_license_detailed(
    id: String,
    state: State<'_, LicenseDb>
) -> Result<LicenseDetails, String> {
    let pool = &state.0;

    let details = sqlx
        ::query_as::<sqlx::Sqlite, LicenseDetails>(
            "SELECT id, license_text, repository, author FROM licenses WHERE id = $1"
        )
        .bind(id)
        .fetch_one(pool).await
        .map_err(|e| e.to_string())?;

    Ok(details)
}
