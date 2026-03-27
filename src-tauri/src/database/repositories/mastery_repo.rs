use crate::models::api::wiki_item::{ WikiComponent, WikiItem };
use crate::models::database::filters::MasteryFilters;
use crate::models::database::item::{ Item, ItemComponent };
use crate::models::database::stats::MasteryStats;
use sqlx::{ Pool, Sqlite, Transaction };

pub async fn find_all_items(
    pool: &Pool<Sqlite>,
    category: &str,
    search: &str,
    filters: &MasteryFilters,
    limit: i64,
    offset: i64
) -> Result<Vec<Item>, sqlx::Error> {
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
        .bind(category)
        .bind(category)
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
        .fetch_all(pool).await?;

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

        let all_components = query.fetch_all(pool).await?;

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

pub async fn get_stats(pool: &Pool<Sqlite>, category: &str) -> Result<MasteryStats, sqlx::Error> {
    let mastery = sqlx
        ::query_as::<_, (i32, i32)>(
            r#"
        SELECT 
            COUNT(*), 
            CAST(COALESCE(SUM(mastered), 0) AS INTEGER) 
        FROM mastery_tracker 
        WHERE (category = ? OR ? = 'All')
        "#
        )
        .bind(category)
        .bind(category)
        .fetch_one(pool).await?;

    let mut h_current = 0;
    let mut h_total = 0;

    if category == "All" || category == "Warframes" {
        let helminth = sqlx
            ::query_as::<_, (i32, i32)>(
                r#"
            SELECT 
                COUNT(*), 
                CAST(COALESCE(SUM(helminthed), 0) AS INTEGER) 
            FROM mastery_tracker 
            WHERE category = 'Warframes' AND name NOT LIKE '%Prime%'
            "#
            )
            .fetch_one(pool).await?;

        h_total = helminth.0;
        h_current = helminth.1;
    }

    Ok(MasteryStats {
        current: mastery.1,
        total: mastery.0,
        helminth_current: h_current,
        helminth_total: h_total,
    })
}

pub async fn update_component_quantity(
    pool: &Pool<Sqlite>,
    item_id: &str,
    component_name: &str,
    quantity: i32
) -> Result<(), sqlx::Error> {
    sqlx
        ::query(
            r#"
        UPDATE item_components 
        SET owned_quantity = CASE 
            WHEN ? > needed_quantity THEN needed_quantity 
            WHEN ? < 0 THEN 0 
            ELSE ? 
        END
        WHERE item_id = ? AND component_name = ?
        "#
        )
        .bind(quantity)
        .bind(quantity)
        .bind(quantity)
        .bind(item_id)
        .bind(component_name)
        .execute(pool).await?;

    Ok(())
}

pub async fn toggle_mastery_field(
    pool: &Pool<Sqlite>,
    item_id: &str,
    field: &str
) -> Result<(), String> {
    let query_str = match field {
        "mastered" => "UPDATE mastery_tracker SET mastered = NOT mastered WHERE id = ?",
        "owned" => "UPDATE mastery_tracker SET owned = NOT owned WHERE id = ?",
        "helminthed" => "UPDATE mastery_tracker SET helminthed = NOT helminthed WHERE id = ?",
        _ => {
            return Err("Invalid field name".into());
        }
    };

    sqlx
        ::query(query_str)
        .bind(item_id)
        .execute(pool).await
        .map_err(|e| e.to_string())?;

    Ok(())
}

pub async fn upsert_mastery_item(
    tx: &mut Transaction<'_, Sqlite>,
    item: &WikiItem
) -> Result<(), sqlx::Error> {
    sqlx
        ::query(
            r#"
        INSERT INTO mastery_tracker (id, name, category, img_path)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(id) DO UPDATE SET 
            name = excluded.name,
            category = excluded.category,
            img_path = excluded.img_path
        "#
        )
        .bind(&item.unique_name)
        .bind(&item.name)
        .bind(&item.category)
        .bind(&item.image_name)
        .execute(&mut **tx).await?;

    Ok(())
}

pub async fn delete_obsolete_components(
    tx: &mut Transaction<'_, Sqlite>,
    item_id: &str,
    valid_components: &[WikiComponent]
) -> Result<(), sqlx::Error> {
    let placeholders = valid_components
        .iter()
        .map(|_| "?")
        .collect::<Vec<_>>()
        .join(",");
    let query_str =
        format!("DELETE FROM item_components WHERE item_id = ? AND component_name NOT IN ({})", placeholders);

    let mut query = sqlx::query(&query_str).bind(item_id);
    for comp in valid_components {
        query = query.bind(&comp.name);
    }

    query.execute(&mut **tx).await?;
    Ok(())
}

pub async fn upsert_item_component(
    tx: &mut Transaction<'_, Sqlite>,
    item_id: &str,
    component_name: &str,
    needed_quantity: i32
) -> Result<(), sqlx::Error> {
    sqlx
        ::query(
            r#"
        INSERT INTO item_components (item_id, component_name, needed_quantity)
        VALUES (?1, ?2, ?3)
        ON CONFLICT(item_id, component_name) DO UPDATE SET 
            needed_quantity = excluded.needed_quantity
        "#
        )
        .bind(item_id)
        .bind(component_name)
        .bind(needed_quantity)
        .execute(&mut **tx).await?;

    Ok(())
}

pub async fn update_craftable_states(tx: &mut Transaction<'_, Sqlite>) -> Result<(), sqlx::Error> {
    sqlx
        ::query(
            r#"
        UPDATE mastery_tracker 
        SET craftable = (
            NOT EXISTS (
                SELECT 1 FROM item_components 
                WHERE item_id = mastery_tracker.id AND owned_quantity < needed_quantity
            )
        )
        WHERE id IN (SELECT DISTINCT item_id FROM item_components)
        "#
        )
        .execute(&mut **tx).await?;

    Ok(())
}
