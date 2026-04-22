use std::{ path::PathBuf, sync::Arc };
use std::time::{ Duration, SystemTime, UNIX_EPOCH };
use tauri::Manager;
use tauri_plugin_log::{ Target, TargetKind, log::{ self, debug, error, info, warn } };
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
    let level = if cfg!(debug_assertions) {
        log::LevelFilter::Debug
    } else {
        log::LevelFilter::Info
    };

    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();

    let mut log_path = std::env
        ::var_os("APPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("."));
    log_path.push("com.chewithewookie.frametracker");
    log_path.push("logs");

    let log_name = format!("app_{}", now);

    tauri::Builder
        ::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_log::Builder
                ::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                    Target::new(TargetKind::Folder {
                        path: log_path.clone(),
                        file_name: Some(log_name.into()),
                    }),
                ])
                .max_file_size(50_000_000)
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
                .level(level)
                .level_for("sqlx", log::LevelFilter::Info)
                .level_for("h2", log::LevelFilter::Info)
                .level_for("hyper", log::LevelFilter::Info)
                .build()
        )
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(commands::command_handler::generate_handler())
        .manage(ActiveProfile(std::sync::Mutex::new(None)))
        .setup(|app| {
            let handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                info!("New session started. Initializing log cleanup...");

                let log_dir = handle.path().app_log_dir().expect("Failed to get log dir");
                if let Ok(entries) = std::fs::read_dir(&log_dir) {
                    let mut logs: Vec<_> = entries
                        .filter_map(|e| e.ok())
                        .filter(|e|
                            e
                                .path()
                                .extension()
                                .map_or(false, |ext| ext == "log")
                        )
                        .collect();

                    info!("Found {} existing log files in {:?}", logs.len(), log_dir);

                    if logs.len() > 5 {
                        logs.sort_by_key(|e|
                            e
                                .metadata()
                                .and_then(|m| m.created())
                                .ok()
                        );

                        let to_delete = logs.len() - 5;
                        info!("Cleaning up {} oldest log files...", to_delete);

                        for old_log in logs.iter().take(to_delete) {
                            let path = old_log.path();
                            if let Err(e) = std::fs::remove_file(&path) {
                                warn!("Failed to delete old log {:?}: {}", path, e);
                            } else {
                                debug!("Deleted old log: {:?}", path);
                            }
                        }
                    }
                }

                info!("Starting FrameTracker backend setup...");

                let app_dir = handle.path().app_data_dir().expect("Failed to get AppData dir");
                let profiles_dir = app_dir.join("profiles");
                let resolved_name = crate::utils::paths::resolve_profile_name(&profiles_dir);

                info!("Resolved initial profile: {}", resolved_name);

                {
                    let state = handle.state::<ActiveProfile>();
                    let mut profile = state.0.lock().expect("Lock failed");
                    *profile = Some(resolved_name);
                }

                let db_path = database::db::get_profile_db_path(
                    &handle,
                    &handle.state::<ActiveProfile>()
                );

                debug!("Initializing database pools at path: {:?}", db_path);
                let user_pool = database::db::create_user_pool(&handle, db_path).await;
                let license_pool = database::db::init_license_db(&handle).await;

                let shared_user_db = Arc::new(tokio::sync::Mutex::new(user_pool));

                handle.manage(database::db::UserDb(shared_user_db.clone()));
                handle.manage(database::db::LicenseDb(license_pool));

                let pool_for_reset = shared_user_db.clone();
                let handle_for_reset = handle.clone();

                tauri::async_runtime::spawn(async move {
                    info!("Background reset task worker spawned.");
                    loop {
                        debug!("Checking for scheduled resets...");
                        {
                            let pool = pool_for_reset.lock().await;
                            if let Err(e) = check_and_apply_resets(&pool, &handle_for_reset).await {
                                error!("Error in background reset task: {}", e);
                            } else {
                                debug!("Reset check completed successfully.");
                            }
                        }
                        sleep(Duration::from_secs(15 * 60)).await;
                    }
                });

                info!("Backend setup complete. Application is ready.");
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
