use crate::database::repositories::mastery_repo;
use crate::models::api::wiki_item::WikiItem;
use crate::models::resources::RESOURCES;
use sqlx::{ Pool, Sqlite };
use tauri::{ AppHandle, Emitter };

pub async fn sync_wiki_items(
    pool: &Pool<Sqlite>,
    items: Vec<WikiItem>,
    handle: AppHandle
) -> Result<(), Box<dyn std::error::Error>> {
    let mut tx = pool.begin().await?;

    for item in items {
        mastery_repo::upsert_mastery_item(&mut tx, &item).await?;

        let components = match item.components {
            Some(comps) => comps,
            None => {
                continue;
            }
        };

        let valid_components: Vec<_> = components
            .into_iter()
            .filter(|c| !RESOURCES.contains(&c.name.as_str()))
            .collect();

        if !valid_components.is_empty() {
            mastery_repo::delete_obsolete_components(
                &mut tx,
                &item.unique_name,
                &valid_components
            ).await?;

            for comp in &valid_components {
                mastery_repo::upsert_item_component(
                    &mut tx,
                    &item.unique_name,
                    &comp.name,
                    comp.item_count
                ).await?;
            }
        }
    }

    mastery_repo::update_craftable_states(&mut tx).await?;

    tx.commit().await?;

    handle.emit("db-initial-sync-complete", ())?;

    Ok(())
}
