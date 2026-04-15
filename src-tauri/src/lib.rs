use crate::database::services::task_services::check_and_apply_resets;
use std::time::Duration;
use tauri::Manager;
use tokio::time::sleep;

pub mod api;
pub mod commands;
pub mod database;
pub mod models;

use crate::commands::{ licenses, mastery_tracker, saved_songs, task_tracker };

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder
        ::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(
            tauri::generate_handler![
                //License Commands
                licenses::get_license_detailed::get_license_detailed,
                licenses::get_license_summaries::get_license_summaries,

                // Mastery Tracker Commands
                mastery_tracker::get_items::get_items,
                mastery_tracker::get_mastery_stats::get_mastery_stats,
                mastery_tracker::set_component::set_component,
                mastery_tracker::set_mastery::set_mastery,

                // Saved Songs Commands
                saved_songs::get_song_details::get_song_details,
                saved_songs::get_song_names::get_song_names,
                saved_songs::set_song::set_song,

                //Task Tracker Commands
                task_tracker::get_tasks::get_tasks,
                task_tracker::get_task_stats::get_task_stats,
                task_tracker::set_favorite::set_favorite,
                task_tracker::set_task::set_task
            ]
        )
        .setup(|app| {
            let handle = app.handle().clone();

            tauri::async_runtime::block_on(async move {
                let user_pool = database::db::init_user_db(&handle).await;
                let license_pool = database::db::init_license_db(&handle).await;

                let pool_for_reset = user_pool.clone();
                let handle_for_reset = handle.clone();

                tauri::async_runtime::spawn(async move {
                    loop {
                        if
                            let Err(e) = check_and_apply_resets(
                                &pool_for_reset,
                                &handle_for_reset
                            ).await
                        {
                            eprintln!("Error in background reset task: {}", e);
                        }
                        sleep(Duration::from_secs(15 * 60)).await;
                    }
                });

                app.manage(database::db::UserDb(user_pool)); //TODO Fix this when profiles are setup
                app.manage(database::db::LicenseDb(license_pool));
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
