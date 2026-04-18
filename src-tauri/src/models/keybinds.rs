use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct KeyConfig {
    pub key: String,
    pub ctrl: bool,
    pub shift: bool,
    pub alt: bool,
    pub is_global: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct KeybindDefinition {
    pub id: String,
    pub label: String,
    pub group: String,
    pub config: KeyConfig,
}

pub type KeybindRegistry = Vec<KeybindDefinition>;
