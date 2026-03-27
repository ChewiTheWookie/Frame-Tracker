use crate::models::api::wiki_item::WikiItem;

pub fn get_custom_items() -> Vec<WikiItem> {
    vec![WikiItem {
        name: "Plexus".to_string(),
        unique_name: "/Lotus/Types/Gear/Plexus".to_string(),
        category: "Vehicles".to_string(),
        masterable: Some(true),
        components: None,
        image_name: None,
    }]
}
