use tauri::{ AppHandle, State };
use crate::{ models::keybinds::KeybindRegistry, utils::paths::get_profile_dir };
use crate::ActiveProfile;

#[tauri::command]
pub async fn set_keybind(
    app: AppHandle,
    mapping: KeybindRegistry,
    active_profile: State<'_, ActiveProfile>
) -> Result<(), String> {
    let profile_dir = get_profile_dir(&app, &active_profile);
    let path = profile_dir.join("keybinds.json");

    println!("Saving keybinds to active profile: {:?}", path);

    let json = serde_json::to_string_pretty(&mapping).map_err(|e| e.to_string())?;
    std::fs::write(path, json).map_err(|e| e.to_string())?;

    Ok(())
}
