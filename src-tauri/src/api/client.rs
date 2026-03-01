use reqwest::header::USER_AGENT;
use serde::de::DeserializeOwned;

const APP_USER_AGENT: &str = "FrameTracker-App/1.0";

pub async fn client<T: DeserializeOwned>(url: &str) -> Result<T, String> {
    let client = reqwest::Client::new();

    let response = client
        .get(url)
        .header(USER_AGENT, APP_USER_AGENT)
        .send().await
        .map_err(|e| format!("Network Error: {}", e))?;

    let data = response
        .json::<T>().await
        .map_err(|e| { format!("JSON Parsing Error: {}. (URL: {})", e, url) })?;

    Ok(data)
}
