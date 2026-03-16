use serde::{ Deserialize, Serialize };
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Task {
    pub id: String,
    pub name: String,
    pub category: String,
    pub current_completions: i32,
    pub max_completions: i32,
    pub last_reset: String,
    pub tags: Option<String>,
    pub reset_interval: Option<String>,
    pub location: Option<String>,
    pub terminal: Option<String>,
    pub quest_required: Option<String>,
    pub icon: Option<String>,
}
