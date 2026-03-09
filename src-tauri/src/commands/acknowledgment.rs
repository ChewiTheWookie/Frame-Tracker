use std::fs;

#[tauri::command]
pub async fn acknowledgment(name: String) -> Result<String, String> {
    let path = format!("../src/assets/{}.json", name);
    fs::read_to_string(path).map_err(|e| e.to_string())
}
