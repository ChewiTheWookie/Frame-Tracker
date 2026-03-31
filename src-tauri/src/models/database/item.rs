use serde::{ Deserialize, Serialize };
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Item {
    pub id: String,
    pub name: String,
    pub category: String,

    pub img_path: Option<String>,

    pub craftable: bool,
    pub owned: bool,
    pub mastered: bool,
    pub helminthed: bool,

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
