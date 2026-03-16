use crate::database::db::UserDb;
use crate::models::database::filters::MasteryFilters;
use crate::models::database::item::{ Item, ItemComponent };

#[tauri::command]
pub async fn get_items(
    state: tauri::State<'_, UserDb>,
    category: String,
    search: String,
    filters: MasteryFilters,
    limit: i64,
    offset: i64
) -> Result<Vec<Item>, String> {
    let pool = &state.0;
    let search_pattern = format!("%{}%", search);

    let mut items = sqlx
        ::query_as::<_, Item>(
            r#"
        SELECT * FROM mastery_tracker 
        WHERE (category = ? OR ? = 'All')
        AND (name LIKE ?)
        AND (NOT (? AND name LIKE '%Prime%'))
        AND (NOT (? AND name NOT LIKE '%Prime%'))
        AND (NOT (? AND mastered = 1))
        AND (NOT (? AND helminthed = 1))
        AND (NOT (? AND owned = 1 AND mastered = 0 AND helminthed = 0))
        AND (NOT (? AND craftable = 1 AND owned = 0 AND mastered = 0 AND helminthed = 0))
        AND (NOT (? AND mastered = 0 AND owned = 0 AND craftable = 0 AND helminthed = 0))
        ORDER BY name ASC
        LIMIT ? OFFSET ?
        "#
        )
        .bind(&category)
        .bind(&category)
        .bind(&search_pattern)
        .bind(filters.hide_prime)
        .bind(filters.hide_non_prime)
        .bind(filters.hide_mastered)
        .bind(filters.hide_helminthed)
        .bind(filters.hide_owned)
        .bind(filters.hide_craftable)
        .bind(filters.hide_unowned)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool).await
        .map_err(|e| e.to_string())?;

    if !items.is_empty() {
        let item_ids: Vec<String> = items
            .iter()
            .map(|i| i.id.clone())
            .collect();

        let placeholders = item_ids
            .iter()
            .map(|_| "?")
            .collect::<Vec<_>>()
            .join(",");

        let query_str =
            format!("SELECT * FROM item_components WHERE item_id IN ({})", placeholders);

        let mut query = sqlx::query_as::<_, ItemComponent>(&query_str);
        for id in &item_ids {
            query = query.bind(id);
        }

        let all_components = query.fetch_all(pool).await.map_err(|e| e.to_string())?;

        for item in &mut items {
            item.components = all_components
                .iter()
                .filter(|c| c.item_id == item.id)
                .cloned()
                .collect();
        }
    }

    Ok(items)
}
