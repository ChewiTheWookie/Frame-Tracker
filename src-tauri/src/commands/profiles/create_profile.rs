use crate::database::db::{ create_user_pool, get_profile_db_path };

#[tauri::command]
pub async fn create_profile(name: String, handle: tauri::AppHandle) -> Result<(), String> {
    if name.contains('.') || name.contains('/') || name.contains('\\') {
        return Err("Invalid profile name".into());
    }

    let path = get_profile_db_path(&handle, &name);
    if path.exists() {
        return Err("Profile already exists".into());
    }

    let _ = create_user_pool(&handle, path).await;

    Ok(())
}
