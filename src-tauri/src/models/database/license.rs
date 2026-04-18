use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct LicenseSummary {
    pub id: String,
    pub name: String,
    pub version: Option<String>,
    pub source: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct LicenseDetails {
    pub id: String,
    pub license_text: Option<String>,
    pub repository: Option<String>,
    pub author: Option<String>,
}
