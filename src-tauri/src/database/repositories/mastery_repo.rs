use crate::database::repositories::mastery_builder::MasteryQueryBuilder;
use crate::models::api::wiki_item::{ WikiComponent, WikiItem };
use crate::models::database::filters::MasteryFilters;
use crate::models::database::item::{ Item, ItemComponent };
use crate::models::database::stats::MasteryStats;
use sqlx::{ Pool, Sqlite, Transaction };
use std::collections::HashMap;
use tauri_plugin_log::log::{ debug, error };

pub async fn find_all_items(
    pool: &Pool<Sqlite>,
    category: &str,
    search: &str,
    filters: &MasteryFilters,
    limit: i64,
    offset: i64
) -> Result<Vec<Item>, sqlx::Error> {
    debug!("find_all_items | Category: {} | Search: '{}'", category, search);

    let mut items = MasteryQueryBuilder::new(category, search, filters)
        .paginate(limit, offset)
        .build()
        .build_query_as::<Item>()
        .fetch_all(pool).await
        .map_err(|e| {
            error!("Failed to fetch mastery items: {}", e);
            e
        })?;

    if items.is_empty() {
        return Ok(items);
    }

    let item_ids: Vec<String> = items
        .iter()
        .map(|i| i.id.clone())
        .collect();

    let mut comp_builder: sqlx::QueryBuilder<Sqlite> = sqlx::QueryBuilder::new(
        "SELECT * FROM item_components WHERE item_id IN ("
    );

    let mut separated = comp_builder.separated(", ");
    for id in &item_ids {
        separated.push_bind(id);
    }
    separated.push_unseparated(")");

    let all_components = comp_builder
        .build_query_as::<ItemComponent>()
        .fetch_all(pool).await
        .map_err(|e| {
            error!("Failed to fetch item components: {}", e);
            e
        })?;

    let mut comp_map: HashMap<String, Vec<ItemComponent>> = HashMap::new();
    for comp in all_components {
        comp_map.entry(comp.item_id.clone()).or_default().push(comp);
    }

    for item in &mut items {
        item.components = comp_map.remove(&item.id).unwrap_or_default();
    }

    debug!("Successfully mapped components for {} items", items.len());
    Ok(items)
}

pub async fn get_stats(
    pool: &Pool<Sqlite>,
    category: &str,
    filters: &MasteryFilters
) -> Result<MasteryStats, sqlx::Error> {
    debug!("get_stats | Category: {}", category);

    let (total, current): (i32, i32) = MasteryQueryBuilder::new(category, "", filters)
        .build_stats()
        .build_query_as::<(i32, i32)>()
        .fetch_one(pool).await
        .map_err(|e| {
            error!("Failed to fetch mastery stats: {}", e);
            e
        })?;

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
        current,
        total,
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
    debug!(
        "Updating component quantity | ID: {} | Comp: {} | Qty: {}",
        item_id,
        component_name,
        quantity
    );

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
    debug!("Toggling mastery field | ID: {} | Field: {}", item_id, field);

    let query_str = match field {
        "mastered" => "UPDATE mastery_tracker SET mastered = NOT mastered WHERE id = ?",
        "owned" => "UPDATE mastery_tracker SET owned = NOT owned WHERE id = ?",
        "helminthed" => "UPDATE mastery_tracker SET helminthed = NOT helminthed WHERE id = ?",
        _ => {
            error!("Invalid mastery field toggle attempt: {}", field);
            return Err("Invalid field name".into());
        }
    };

    sqlx
        ::query(query_str)
        .bind(item_id)
        .execute(pool).await
        .map_err(|e| {
            error!("Failed to toggle mastery field '{}': {}", field, e);
            e.to_string()
        })?;

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
    if valid_components.is_empty() {
        sqlx
            ::query("DELETE FROM item_components WHERE item_id = ?")
            .bind(item_id)
            .execute(&mut **tx).await?;
        return Ok(());
    }

    let mut builder: sqlx::QueryBuilder<Sqlite> = sqlx::QueryBuilder::new(
        "DELETE FROM item_components WHERE item_id = "
    );

    builder.push_bind(item_id);
    builder.push(" AND component_name NOT IN (");

    let mut separated = builder.separated(", ");
    for comp in valid_components {
        separated.push_bind(&comp.name);
    }
    separated.push_unseparated(")");

    builder.build().execute(&mut **tx).await?;
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
    debug!("Updating craftable states for all items");

    sqlx
        ::query(
            r#"
        UPDATE mastery_tracker 
        SET craftable = (
            EXISTS (
                SELECT 1 FROM item_components 
                WHERE item_id = mastery_tracker.id
            )
            AND 
            NOT EXISTS (
                SELECT 1 FROM item_components 
                WHERE item_id = mastery_tracker.id 
                AND owned_quantity < needed_quantity
            )
        )
        "#
        )
        .execute(&mut **tx).await?;

    Ok(())
}
