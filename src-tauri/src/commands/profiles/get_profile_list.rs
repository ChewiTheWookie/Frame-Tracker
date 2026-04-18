use tauri::Manager;

#[tauri::command]
pub async fn get_profile_list(handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let app_dir = handle
        .path()
        .app_data_dir()
        .expect("Failed to get AppData dir");
    let profiles_dir = app_dir.join("profiles");

    if !profiles_dir.exists() {
        return Ok(vec!["Default".to_string()]);
    }

    let mut profiles = Vec::new();
    if let Ok(entries) = std::fs::read_dir(profiles_dir) {
        for entry in entries.flatten() {
            if let Ok(file_type) = entry.file_type() {
                if file_type.is_dir() {
                    profiles.push(entry.file_name().to_string_lossy().into_owned());
                }
            }
        }
    }

    Ok(profiles)
}
