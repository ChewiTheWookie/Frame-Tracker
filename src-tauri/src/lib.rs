use std::time::Duration;
use std::sync::Arc;
use tauri::Manager;
use tokio::time::sleep;

pub mod api;
pub mod commands;
pub mod config;
pub mod database;
pub mod models;
pub mod utils;

use crate::commands::{ keybinds, licenses, mastery_tracker, profiles, saved_songs, task_tracker };
use crate::database::services::task_services::check_and_apply_resets;

pub struct ActiveProfile(pub std::sync::Mutex<Option<String>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder
        ::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(
            tauri::generate_handler![
                // Keybind Commands
                keybinds::get_keybinds::get_keybinds,
                keybinds::set_keybind::set_keybind,

                // License Commands
                licenses::get_license_detailed::get_license_detailed,
                licenses::get_license_summaries::get_license_summaries,

                // Mastery Tracker Commands
                mastery_tracker::get_items::get_items,
                mastery_tracker::get_mastery_stats::get_mastery_stats,
                mastery_tracker::set_component::set_component,
                mastery_tracker::set_mastery::set_mastery,

                // Profile Commands
                profiles::create_profile::create_profile,
                profiles::delete_profile::delete_profile,
                profiles::get_current_profile::get_current_profile,
                profiles::get_profile_list::get_profile_list,
                profiles::set_profile_name::set_profile_name,
                profiles::switch_profile::switch_profile,

                // Saved Songs Commands
                saved_songs::delete_song::delete_song,
                saved_songs::get_song_details::get_song_details,
                saved_songs::get_song_names::get_song_names,
                saved_songs::set_song_name::set_song_name,
                saved_songs::set_song::set_song,

                //Task Tracker Commands
                task_tracker::get_tasks::get_tasks,
                task_tracker::get_task_stats::get_task_stats,
                task_tracker::set_favorite::set_favorite,
                task_tracker::set_task::set_task
            ]
        )
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
                                eprintln!("Error in background reset task: {}", e);
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
