use reqwest::{ header, Client };
use std::time::Duration;

pub struct ApiClient {
    pub client: Client,
}

impl ApiClient {
    pub fn new() -> Self {
        let version = env!("CARGO_PKG_VERSION");
        let user_agent = format!("FrameTracker/{}", version);

        let mut headers = header::HeaderMap::new();
        headers.insert(header::USER_AGENT, header::HeaderValue::from_str(&user_agent).unwrap());

        let client = Client::builder()
            .default_headers(headers)
            .timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to create reqwest client");

        Self { client }
    }
}
