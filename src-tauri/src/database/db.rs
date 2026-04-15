use sqlx::migrate;
use sqlx::{ sqlite::SqlitePoolOptions, Pool, Sqlite };
use std::fs;
use std::path::{ Path, PathBuf };
use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::{ path::BaseDirectory, AppHandle, Manager };
use crate::api::client::ApiClient;
use crate::api::requests::fetch_wiki_items::fetch_wiki_items;
use crate::database::services::{
    item_services::sync_wiki_items,
    migration_services::run_relational_migration,
};

pub struct UserDb(pub Arc<Mutex<Pool<Sqlite>>>);
pub struct LicenseDb(pub Pool<Sqlite>);

fn migrate_legacy_db(app_dir: &Path) {
    let legacy_db_path = app_dir.join("user_profile.db");
    let default_profile_dir = app_dir.join("profiles").join("Default");
    let new_db_path = default_profile_dir.join("user_profile.db");

    if legacy_db_path.exists() && !new_db_path.exists() {
        if let Err(e) = fs::create_dir_all(&default_profile_dir) {
            eprintln!("Migration: Failed to create Default directory: {}", e);
            return;
        }

        if let Err(e) = fs::rename(&legacy_db_path, &new_db_path) {
            eprintln!("Migration: Failed to move legacy database: {}", e);
        } else {
            println!("Migration: Successfully moved legacy database to profiles/Default");
        }
    }
}

fn resolve_profile_name(profiles_dir: &Path) -> String {
    if let Ok(entries) = fs::read_dir(profiles_dir) {
        let mut first_folder = None;

        for entry in entries.flatten() {
            if let Ok(file_type) = entry.file_type() {
                if file_type.is_dir() {
                    let name = entry.file_name().to_string_lossy().into_owned();
                    if name == "Default" {
                        return name;
                    }
                    if first_folder.is_none() {
                        first_folder = Some(name);
                    }
                }
            }
        }

        if let Some(folder) = first_folder {
            return folder;
        }
    }

    "Default".to_string()
}

pub fn get_profile_db_path(handle: &AppHandle, profile_name: Option<&str>) -> PathBuf {
    let app_dir = handle.path().app_data_dir().expect("Failed to get AppData dir");
    let profiles_dir = app_dir.join("profiles");

    migrate_legacy_db(&app_dir);

    let target_name = match profile_name {
        Some(name) => name.to_string(),
        None => resolve_profile_name(&profiles_dir),
    };

    let profile_dir = profiles_dir.join(&target_name);

    if !profile_dir.exists() {
        fs::create_dir_all(&profile_dir).expect("Failed to create profile directory");
    }

    profile_dir.join("user_profile.db")
}

pub async fn create_user_pool(handle: &AppHandle, db_path: PathBuf) -> Pool<Sqlite> {
    let db_url = format!("sqlite:{}?mode=rwc", db_path.to_string_lossy()).replace("\\", "/");

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
        eprintln!("Migration logic failed: {}", e);
    }

    let sync_pool = pool.clone();
    let api_client = ApiClient::new();
    let handle_clone = handle.clone();

    tauri::async_runtime::spawn(async move {
        if let Ok(items) = fetch_wiki_items(&api_client).await {
            if !items.is_empty() {
                let _ = sync_wiki_items(&sync_pool, items, handle_clone).await.map_err(|e| {
                    eprintln!("Wiki sync error: {}", e);
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
