use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub async fn get_logs() -> Result<String, String> {
    let mut log_path = std::env
        ::var_os("APPDATA")
        .map(PathBuf::from)
        .ok_or_else(|| "Could not find APPDATA directory".to_string())?;

    log_path.push("com.chewithewookie.frametracker");
    log_path.push("logs");
    log_path.push("app.log");

    if !log_path.exists() {
        return Err("Log file does not exist yet.".to_string());
    }

    fs::read_to_string(log_path).map_err(|e| format!("Failed to read log file: {}", e))
}
