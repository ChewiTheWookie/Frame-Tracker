use std::collections::HashSet;
use crate::api::client;
use crate::models::mastery_tracker::{ WikiItem, ProcessedItem, Component, EXCLUSIONS, CATEGORIES };
use crate::models::{ RESOURCES };

fn get_category(id: &str, name: &str) -> String {
    for cat in CATEGORIES {
        for key in cat.keywords {
            if id.contains(key) || name.contains(key) {
                return cat.name.to_string();
            }
        }
    }

    println!("DEBUG: Unknown Category for Name: {} | ID: {}", name, id);
    "Unknown".to_string()
}

pub async fn get_wiki_data() -> Result<Vec<ProcessedItem>, String> {
    let url = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/All.json";
    let items: Vec<WikiItem> = client(url).await?;

    let resource_set: HashSet<&str> = RESOURCES.iter().cloned().collect();

    println!("FETCHING DATA");

    let processed = items
        .into_iter()

        .filter(|item| {
            let path = item.unique_name.to_lowercase();

            let is_valid_base = if let Some(true) = item.masterable {
                true
            } else if path.contains("operatoramplifiers") && path.contains("barrel") {
                !path.contains("scaffold") && !path.contains("brace")
            } else if
                path.contains("harness") ||
                path.contains("moamodels") ||
                path.contains("hoverboard") ||
                path.contains("nechrotech/exaltedartilleryweapon")
            {
                !path.contains("core") && !path.contains("jet") && !path.contains("bracket")
            } else {
                false
            };

            if !is_valid_base {
                return false;
            }
            if EXCLUSIONS.iter().any(|ex| item.unique_name.contains(ex)) {
                return false;
            }

            true
        })
        .map(|item| {
            let category = get_category(&item.unique_name, &item.name);
            let is_prime = item.name.contains("Prime");
            let is_necramech = item.name == "Voidrig" || item.name == "Bonewidow";
            let is_feedable = category == "Warframes" && !is_prime && !is_necramech;

            let filtered_components: Vec<Component> = item.components
                .unwrap_or_default()
                .into_iter()
                .filter(|comp| !resource_set.contains(comp.name.as_str()))
                .collect();

            ProcessedItem {
                id: item.unique_name,
                name: item.name,
                image: format!(
                    "https://cdn.warframestat.us/img/{}",
                    item.image_name.as_deref().unwrap_or_default()
                ),
                category,
                is_prime,
                is_feedable,
                components: filtered_components,
            }
        })
        .collect();

    Ok(processed)
}
