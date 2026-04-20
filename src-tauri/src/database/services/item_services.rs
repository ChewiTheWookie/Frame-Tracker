use crate::database::repositories::mastery_repo;
use crate::models::api::wiki_item::WikiItem;
use sqlx::{ Pool, Sqlite };
use tauri::{ AppHandle, Emitter };
use tauri_plugin_log::log::{ debug, error, info, warn };

pub async fn sync_wiki_items(
    pool: &Pool<Sqlite>,
    items: Vec<WikiItem>,
    handle: AppHandle
) -> Result<(), Box<dyn std::error::Error>> {
    info!("Starting wiki items sync | Total items: {}", items.len());

    let mut tx = pool.begin().await.map_err(|e| {
        error!("Failed to begin transaction for wiki sync: {}", e);
        e
    })?;

    for item in items {
        debug!("Syncing item: {} ({})", item.name, item.unique_name);

        mastery_repo::upsert_mastery_item(&mut tx, &item).await?;

        if let Some(components) = item.components {
            if !components.is_empty() {
                mastery_repo::delete_obsolete_components(
                    &mut tx,
                    &item.unique_name,
                    &components
                ).await?;

                for comp in &components {
                    mastery_repo::upsert_item_component(
                        &mut tx,
                        &item.unique_name,
                        &comp.name,
                        comp.item_count
                    ).await?;
                }
            }
        }
    }

    debug!("Updating craftable states...");
    mastery_repo::update_craftable_states(&mut tx).await?;

    tx.commit().await.map_err(|e| {
        error!("Failed to commit wiki sync transaction: {}", e);
        e
    })?;

    info!("Wiki items sync completed successfully");

    handle.emit("db-initial-sync-complete", ()).map_err(|e| {
        warn!("Failed to emit sync completion event: {}", e);
        e
    })?;

    Ok(())
}
