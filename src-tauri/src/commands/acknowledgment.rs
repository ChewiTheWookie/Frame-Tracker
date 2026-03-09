use tauri::{ AppHandle, Manager, path::BaseDirectory };
use std::fs;
use std::path::PathBuf;

#[tauri::command]
pub async fn acknowledgment(app: AppHandle, name: String) -> Result<String, String> {
    let filename = format!("{}.json", name);

    let path: PathBuf = if cfg!(debug_assertions) {
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("..")
            .join("src")
            .join("assets")
            .join(format!("{}.json", name))
    } else {
        app
            .path()
            .resolve(format!("assets/{}", filename), BaseDirectory::Resource)
            .map_err(|e| e.to_string())?
    };

    if !path.exists() {
        return Err(format!("FrameTracker Error: File not found at {:?}", path));
    }

    fs::read_to_string(path).map_err(|e| e.to_string())
}
