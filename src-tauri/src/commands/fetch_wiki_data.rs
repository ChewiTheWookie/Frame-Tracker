use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Component {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WikiItem {
    pub unique_name: String,
    pub name: String,
    pub image_name: Option<String>,
    pub masterable: Option<bool>,
    pub components: Option<Vec<Component>>,
}

#[tauri::command]
pub async fn fetch_wiki_data() -> Result<Vec<WikiItem>, String> {
    let url = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/All.json";

    let response = reqwest::get(url).await.map_err(|e| e.to_string())?;
    let items: Vec<WikiItem> = response.json().await.map_err(|e| e.to_string())?;

    let filtered: Vec<WikiItem> = items
        .into_iter()
        .filter(|item| {
            let path = item.unique_name.to_lowercase();

            if let Some(true) = item.masterable {
                return true;
            }

            if path.contains("operatoramplifiers") && path.contains("barrel") {
                return !path.contains("scaffold") && !path.contains("brace");
            }

            if
                path.contains("harness") ||
                path.contains("moamodels") ||
                path.contains("hoverboard") ||
                path.contains("nechrotech/exaltedartilleryweapon")
            {
                return !path.contains("core") && !path.contains("jet") && !path.contains("bracket");
            }

            false
        })
        .collect();

    Ok(filtered)
}
