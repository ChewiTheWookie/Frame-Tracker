use crate::api::client::ApiClient;
use crate::api::requests::fetch_wiki_items::fetch_wiki_items;
use crate::database::services::{
    item_services::sync_wiki_items,
    migration_services::run_relational_migration,
};
use sqlx::{ migrate, sqlite::SqlitePoolOptions, Pool, Sqlite };
use std::fs;
use tauri::{ path::BaseDirectory, AppHandle, Manager };

pub struct UserDb(pub Pool<Sqlite>);
pub struct LicenseDb(pub Pool<Sqlite>);

pub async fn init_user_db(handle: &AppHandle) -> Pool<Sqlite> {
    let app_dir = handle.path().app_data_dir().expect("Failed to get AppData dir");
    fs::create_dir_all(&app_dir).unwrap();

    let db_path = app_dir.join("user_profile.db"); //TODO fix file name when profiles are setup
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

    let pool = SqlitePoolOptions::new()
        .max_connections(2)
        .connect_with(db_url).await
        .expect("Failed to connect to License DB");

    pool
}
