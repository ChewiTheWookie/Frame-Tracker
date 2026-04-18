use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WikiItem {
    pub unique_name: String,
    pub name: String,
    pub category: String,
    pub image_name: Option<String>,
    pub masterable: Option<bool>,
    pub components: Option<Vec<WikiComponent>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WikiComponent {
    pub name: String,
    pub unique_name: String,
    pub item_count: i32,
}
