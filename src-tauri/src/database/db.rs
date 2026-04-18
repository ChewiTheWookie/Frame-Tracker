use crate::api::client::ApiClient;
use crate::api::requests::fetch_wiki_items::fetch_wiki_items;
use crate::database::services::{
    item_services::sync_wiki_items,
    migration_services::run_relational_migration,
};
use crate::utils::paths::get_profile_dir;
use crate::ActiveProfile;
use sqlx::migrate;
use sqlx::{ sqlite::SqlitePoolOptions, Pool, Sqlite };
use tauri_plugin_log::log::{ error, info };
use std::fs;
use std::path::{ Path, PathBuf };
use std::sync::Arc;
use tauri::{ path::BaseDirectory, AppHandle, Manager };
use tokio::sync::Mutex;

pub struct UserDb(pub Arc<Mutex<Pool<Sqlite>>>);
pub struct LicenseDb(pub Pool<Sqlite>);

fn migrate_legacy_db(app_dir: &Path) {
    let legacy_db_path = app_dir.join("user_profile.db");
    let default_profile_dir = app_dir.join("profiles").join("Default");
    let new_db_path = default_profile_dir.join("user_profile.db");

    if legacy_db_path.exists() && !new_db_path.exists() {
        if let Err(e) = fs::create_dir_all(&default_profile_dir) {
            error!("Migration: Failed to create Default directory: {}", e);
            return;
        }

        if let Err(e) = fs::rename(&legacy_db_path, &new_db_path) {
            error!("Migration: Failed to move legacy database: {}", e);
        } else {
            info!("Migration: Successfully moved legacy database to profiles/Default");
        }
    }
}

pub fn get_profile_db_path(handle: &AppHandle, active_profile: &ActiveProfile) -> PathBuf {
    let app_dir = handle.path().app_data_dir().expect("Failed to get AppData dir");
    migrate_legacy_db(&app_dir);

    get_profile_dir(handle, active_profile).join("user_profile.db")
}

pub async fn create_user_pool(handle: &AppHandle, db_path: PathBuf) -> Pool<Sqlite> {
    if let Some(parent) = db_path.parent() {
        let _ = fs::create_dir_all(parent);
    }

    let path_str = db_path.to_string_lossy().replace("\\", "/");

    let db_url = format!("sqlite:///{}?mode=rwc", path_str);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url).await
        .expect("Failed to connect to User DB");

    sqlx::query("PRAGMA journal_mode = WAL;").execute(&pool).await.expect("Failed to set WAL mode");
    sqlx::query("PRAGMA foreign_keys = ON;")
        .execute(&pool).await
        .expect("Failed to enable foreign keys");

    migrate!("./migrations/user").run(&pool).await.expect("Failed to run user DB migrations");

    if let Err(e) = run_relational_migration(&pool).await {
        error!("Migration logic failed: {}", e);
    }

    let sync_pool = pool.clone();
    let api_client = ApiClient::new();
    let handle_clone = handle.clone();

    tauri::async_runtime::spawn(async move {
        if let Ok(items) = fetch_wiki_items(&api_client).await {
            if !items.is_empty() {
                let _ = sync_wiki_items(&sync_pool, items, handle_clone).await.map_err(|e| {
                    error!("Wiki sync error: {}", e);
                });
            }
        }
    });

    pool
}

pub async fn init_license_db(handle: &AppHandle) -> Pool<Sqlite> {
    let resource_path = handle
        .path()
        .resolve("resources/licenses.db", BaseDirectory::Resource)
        .expect("Failed to resolve resource path for licenses.db");

    let path_str = resource_path.to_string_lossy().replace("\\\\?\\", "");
    let db_url = sqlx::sqlite::SqliteConnectOptions::new().filename(path_str).read_only(true);

    SqlitePoolOptions::new()
        .max_connections(2)
        .connect_with(db_url).await
        .expect("Failed to connect to License DB")
}
