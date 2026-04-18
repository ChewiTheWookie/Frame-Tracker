use std::sync::Arc;
use std::time::Duration;
use tauri::Manager;
use tauri_plugin_log::{ Target, TargetKind, log::{ self, error } };
use tokio::time::sleep;

pub mod api;
pub mod commands;
pub mod config;
pub mod database;
pub mod models;
pub mod utils;

use crate::database::services::task_services::check_and_apply_resets;

pub struct ActiveProfile(pub std::sync::Mutex<Option<String>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder
        ::default()
        .plugin(
            tauri_plugin_log::Builder::new().level(tauri_plugin_log::log::LevelFilter::Info).build()
        )
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_log::Builder
                ::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: Some("app".into()) }),
                    Target::new(TargetKind::Webview),
                ])
                .level(log::LevelFilter::Info)
                .build()
        )
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(commands::command_handler::generate_handler())
        .manage(ActiveProfile(std::sync::Mutex::new(None)))
        .setup(|app| {
            let handle = app.handle().clone();

            tauri::async_runtime::block_on(async move {
                let app_dir = handle.path().app_data_dir().expect("Failed to get AppData dir");
                let profiles_dir = app_dir.join("profiles");

                let resolved_name = crate::utils::paths::resolve_profile_name(&profiles_dir);

                {
                    let state = handle.state::<ActiveProfile>();
                    let mut profile = state.0.lock().expect("Lock failed");
                    *profile = Some(resolved_name);
                }

                let default_path = database::db::get_profile_db_path(
                    &handle,
                    &handle.state::<ActiveProfile>()
                );

                let user_pool = database::db::create_user_pool(&handle, default_path).await;
                let license_pool = database::db::init_license_db(&handle).await;

                let shared_user_db = Arc::new(tokio::sync::Mutex::new(user_pool));

                let pool_for_reset = shared_user_db.clone();
                let handle_for_reset = handle.clone();

                tauri::async_runtime::spawn(async move {
                    loop {
                        {
                            let pool = pool_for_reset.lock().await;
                            if let Err(e) = check_and_apply_resets(&pool, &handle_for_reset).await {
                                error!("Error in background reset task: {}", e);
                            }
                        }

                        sleep(Duration::from_secs(15 * 60)).await;
                    }
                });

                app.manage(database::db::UserDb(shared_user_db));
                app.manage(database::db::LicenseDb(license_pool));
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
