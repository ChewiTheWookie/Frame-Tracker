use reqwest::{ header, Client };
use std::time::Duration;
use tauri_plugin_log::log::{ debug, error, info };

pub struct ApiClient {
    pub client: Client,
}

impl ApiClient {
    pub fn new() -> Self {
        let version = env!("CARGO_PKG_VERSION");
        let user_agent = format!("FrameTracker/{}", version);

        debug!("Initializing ApiClient with User-Agent: {}", user_agent);

        let mut headers = header::HeaderMap::new();
        headers.insert(
            header::USER_AGENT,
            header::HeaderValue::from_str(&user_agent).unwrap_or_else(|e| {
                error!("Failed to construct User-Agent header: {}", e);
                header::HeaderValue::from_static("FrameTracker/Unknown")
            })
        );

        let client = Client::builder()
            .default_headers(headers)
            .timeout(Duration::from_secs(30))
            .build()
            .unwrap_or_else(|e| {
                error!("Critical failure: Could not build reqwest client: {}", e);
                panic!("Failed to create reqwest client: {}", e);
            });

        info!("ApiClient successfully initialized (timeout: 30s)");

        Self { client }
    }
}
