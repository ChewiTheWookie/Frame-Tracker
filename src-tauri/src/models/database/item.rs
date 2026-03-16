use serde::{ Deserialize, Serialize };
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Item {
    pub id: String,
    pub name: String,
    pub category: String,
    pub mastered: bool,
    pub helminthed: bool,
    pub owned: bool,
    pub craftable: bool,
    pub img_path: Option<String>,

    #[sqlx(skip)]
    pub components: Vec<ItemComponent>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ItemComponent {
    pub id: i32,
    pub item_id: String,
    pub component_name: String,
    pub needed_quantity: i32,
    pub owned_quantity: i32,
}
