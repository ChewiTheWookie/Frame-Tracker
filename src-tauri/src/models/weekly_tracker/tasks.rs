use serde::{ Deserialize, Serialize };
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WeeklyTask {
    pub id: String,
    pub name: String,
    pub category: String,

    #[sqlx(rename = "current_completions")]
    pub current_completions: i32,

    #[sqlx(rename = "max_completions")]
    pub max_completions: i32,

    #[sqlx(rename = "last_reset")]
    pub last_reset: String,
}

pub const DEFAULT_WEEKLY_TASKS: [(&str, &str, &str, i32, i32); 7] = [
    ("sortie", "Sortie", "Daily", 0, 1),

    ("archon_hunt", "Archon Hunt", "Weekly", 0, 1),
    ("netracells", "Netracells", "Weekly", 0, 5),
    ("deep_archimedea", "Deep Archimedea", "Weekly", 0, 1),
    ("kahl_mission", "Kahl's Mission", "Weekly", 0, 1),
    ("circuit", "Circuit", "Weekly", 0, 1),
    ("circuit_steel", "Steel Path Circuit", "Weekly", 0, 1),
];
