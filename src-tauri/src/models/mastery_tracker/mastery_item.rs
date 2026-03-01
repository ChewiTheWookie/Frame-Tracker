use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WikiItem {
    pub unique_name: String,
    pub name: String,
    pub image_name: Option<String>,
    pub masterable: Option<bool>,
    pub components: Option<Vec<Component>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProcessedItem {
    pub id: String,
    pub name: String,
    pub image: String,
    pub category: String,
    pub is_prime: bool,
    pub is_feedable: bool,
    pub components: Vec<Component>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Component {
    pub name: String,
}
