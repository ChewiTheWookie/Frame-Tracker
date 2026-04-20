use crate::api::client::ApiClient;
use crate::models::api::wiki_item::WikiComponent;
use crate::models::api::{
    category_mapper,
    custom_items,
    exclusion_mapper,
    masterable_overrides,
    wiki_item::WikiItem,
};
use crate::models::resources::RESOURCES;
use tauri_plugin_log::log::{ debug, error, info, warn };
use std::collections::{ HashMap, HashSet };

pub async fn fetch_wiki_items(
    api_client: &ApiClient
) -> Result<Vec<WikiItem>, Box<dyn std::error::Error + Send + Sync>> {
    let url = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/All.json";

    debug!("Fetching wiki items from: {}", url);

    let response = api_client.client
        .get(url)
        .send().await
        .map_err(|e| {
            error!("Network error fetching wiki items: {}", e);
            e
        })?;

    let bytes = response.bytes().await?;
    debug!("Received {} bytes from API", bytes.len());

    let resource_lookup: HashSet<&str> = RESOURCES.iter().copied().collect();

    let all_items: Vec<WikiItem> = serde_json::from_slice(&bytes).map_err(|e| {
        error!("Failed to deserialize wiki JSON: {}", e);
        e
    })?;

    let mut filtered: Vec<WikiItem> = all_items
        .into_iter()
        .filter_map(|mut item| {
            let name = &item.name;
            let unique_name = &item.unique_name;

            let is_api_masterable = item.masterable.unwrap_or(false);
            let is_forced = masterable_overrides::get_force_masterable_map(name, unique_name);

            if !(is_api_masterable || is_forced) {
                return None;
            }

            if is_forced && !is_api_masterable {
                info!("[Added] Including: {} ID: {}", name, unique_name);
            }

            if exclusion_mapper::get_exclusion_map(name, unique_name) {
                info!("[Excluded] Blocking: {} ID: {}", name, unique_name);
                return None;
            }

            match category_mapper::get_category_map(&item.category, name, unique_name) {
                Some(new_cat) => {
                    item.category = new_cat.to_string();
                }
                None => {
                    warn!(
                        "[Skipped] No UI Category: {} (API: {}) ID: {}",
                        name,
                        item.category,
                        unique_name
                    );
                    return None;
                }
            }

            if let Some(comps) = item.components {
                let mut merged_comps: HashMap<String, WikiComponent> = HashMap::new();

                for c in comps.into_iter() {
                    if resource_lookup.contains(c.name.as_str()) {
                        continue;
                    }

                    merged_comps
                        .entry(c.name.clone())
                        .and_modify(|existing| {
                            existing.item_count += c.item_count;
                        })
                        .or_insert(c);
                }

                item.components = Some(merged_comps.into_values().collect());
            }

            Some(item)
        })
        .collect();

    let custom_list = custom_items::get_custom_items();
    for item in &custom_list {
        info!("[Added] Custom: {}", item.name);
    }

    let total_count = filtered.len() + custom_list.len();
    filtered.extend(custom_list);

    info!("Successfully processed {} total wiki items", total_count);

    Ok(filtered)
}
