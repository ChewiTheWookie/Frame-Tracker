use serde::{ Deserialize, Serialize };
use reqwest::header::USER_AGENT;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorldState {
    pub sortie: Sortie,
    pub cetus_cycle: CetusCycle,
    pub alerts: Vec<Alert>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Sortie {
    pub id: String,
    pub boss: String,
    pub faction: String,
    pub expiry: String,
    pub variants: Vec<SortieVariant>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SortieVariant {
    pub mission_type: String,
    pub modifier: String,
    pub modifier_description: String,
    pub node: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CetusCycle {
    pub is_day: bool,
    pub time_left: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Alert {
    pub mission: AlertMission,
    pub expiry: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AlertMission {
    pub node: String,
    pub type_key: String,
    pub reward: AlertReward,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AlertReward {
    pub items: Vec<String>,
}

#[tauri::command]
pub async fn fetch_world_data() -> Result<WorldState, String> {
    let url = "https://api.warframestat.us/pc?language=en";

    let client = reqwest::Client::new();
    let response = client
        .get(url)
        .header(USER_AGENT, "FrameTracker-App/1.0")
        .send().await
        .map_err(|e| e.to_string())?;

    let state: WorldState = response
        .json().await
        .map_err(|e| {
            format!("JSON Parsing Error: {}. Check if the API returned HTML instead of JSON.", e)
        })?;

    Ok(state)
}
