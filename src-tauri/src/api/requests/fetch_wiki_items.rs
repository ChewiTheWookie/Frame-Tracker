use owo_colors::OwoColorize;
use crate::api::client::ApiClient;
use crate::models::api::category_mapper::CategoryMapper;
use crate::models::api::exclusion_mapper::ItemExclusion;
use crate::models::api::wiki_item::WikiItem;
use crate::models::resources::RESOURCES;

pub async fn fetch_wiki_items(
    api_client: &ApiClient
) -> Result<Vec<WikiItem>, Box<dyn std::error::Error + Send + Sync>> {
    let url = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/All.json";
    let response = api_client.client.get(url).send().await?;

    let bytes = response.bytes().await?;
    let all_items: Vec<WikiItem> = serde_json::from_slice(&bytes)?;

    let filtered: Vec<WikiItem> = all_items
        .into_iter()
        .filter(|item| {
            let is_api_masterable = item.masterable.unwrap_or(false);
            let is_forced =
                crate::models::api::masterable_overrides::MasterableOverrides::is_force_masterable(
                    &item.name,
                    &item.unique_name
                );

            if is_forced && !is_api_masterable {
                println!(
                    "{}",
                    format!("[Added] Including: {} ID: {}", item.name, item.unique_name).green()
                );
            }

            is_api_masterable || is_forced
        })
        .filter(|item| {
            let excluded = ItemExclusion::should_exclude(&item.name, &item.unique_name);
            if excluded {
                println!(
                    "{}",
                    format!("[Excluded] Blocking: {} ID: {}", item.name, item.unique_name).cyan()
                );
            }
            !excluded
        })
        .filter_map(|mut item| {
            match CategoryMapper::get_ui_category(&item.category, &item.name, &item.unique_name) {
                Some(new_cat) => {
                    item.category = new_cat;
                    Some(item)
                }
                None => {
                    println!(
                        "{}",
                        format!(
                            "[Skipped] No UI Category: {} (API: {}) ID: {}",
                            item.name,
                            item.category,
                            item.unique_name
                        ).yellow()
                    );
                    None
                }
            }
        })
        .map(|mut item| {
            if let Some(comps) = item.components {
                item.components = Some(
                    comps
                        .into_iter()
                        .filter(|c| { !RESOURCES.contains(&c.name.as_str()) })
                        .collect()
                );
            }
            item
        })
        .collect();

    Ok(filtered)
}
