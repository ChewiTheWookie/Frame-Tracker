use std::fs;
use std::path::PathBuf;

use tauri_plugin_log::log::{ debug, error };

#[tauri::command]
pub async fn get_logs() -> Result<String, String> {
    let mut log_path = std::env
        ::var_os("APPDATA")
        .map(PathBuf::from)
        .ok_or_else(|| {
            let err = "Could not find APPDATA directory".to_string();
            error!("{}", err);
            err
        })?;

    log_path.push("com.chewithewookie.frametracker");
    log_path.push("logs");
    log_path.push("app.log");

    debug!("Attempting to read log file at: {:?}", log_path);

    if !log_path.exists() {
        let err_msg = "Log file does not exist yet.".to_string();
        debug!("{}", err_msg);
        return Err(err_msg);
    }

    fs::read_to_string(&log_path).map_err(|e| {
        let err_msg = format!("Failed to read log file: {}", e);
        error!("{}", err_msg);
        err_msg
    })
}
