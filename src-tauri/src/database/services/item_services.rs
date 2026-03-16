use sqlx::{ Pool, Sqlite };
use tauri::{ AppHandle, Emitter };
use crate::models::api::wiki_item::WikiItem;
use crate::models::resources::RESOURCES;

pub async fn sync_wiki_items(
    pool: &Pool<Sqlite>,
    items: Vec<WikiItem>,
    handle: AppHandle
) -> Result<(), Box<dyn std::error::Error>> {
    let mut tx = pool.begin().await?;

    for item in items {
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
            .execute(&mut *tx).await?;

        if let Some(components) = item.components {
            let valid_comp_names: Vec<String> = components
                .iter()
                .filter(|c| !RESOURCES.contains(&c.name.as_str()))
                .map(|c| c.name.clone())
                .collect();

            if !valid_comp_names.is_empty() {
                let query_builder = format!(
                    "DELETE FROM item_components WHERE item_id = ? AND component_name NOT IN ({})",
                    valid_comp_names
                        .iter()
                        .map(|_| "?")
                        .collect::<Vec<_>>()
                        .join(",")
                );

                let mut delete_query = sqlx::query(&query_builder).bind(&item.unique_name);
                for name in valid_comp_names {
                    delete_query = delete_query.bind(name);
                }
                delete_query.execute(&mut *tx).await?;
            }

            for comp in components {
                if RESOURCES.contains(&comp.name.as_str()) {
                    continue;
                }

                sqlx
                    ::query(
                        r#"
                    INSERT INTO item_components (item_id, component_name, needed_quantity)
                    VALUES (?1, ?2, ?3)
                    ON CONFLICT(item_id, component_name) DO UPDATE SET 
                        needed_quantity = excluded.needed_quantity
                    "#
                    )
                    .bind(&item.unique_name)
                    .bind(&comp.name)
                    .bind(comp.item_count)
                    .execute(&mut *tx).await?;
            }
        }
    }

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
        .execute(&mut *tx).await?;

    tx.commit().await?;

    handle.emit("db-initial-sync-complete", ())?;

    Ok(())
}
