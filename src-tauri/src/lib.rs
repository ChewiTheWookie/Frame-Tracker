use tauri::Manager;
use std::time::Duration;
use tokio::time::sleep;
use crate::database::services::task_services::check_and_apply_resets;

pub mod api;
pub mod commands;
pub mod database;
pub mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder
        ::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(
            tauri::generate_handler![
                //License Commands
                commands::licenses::get_license_detailed::get_license_detailed,
                commands::licenses::get_license_summaries::get_license_summaries,

                // Mastery Tracker Commands
                commands::mastery_tracker::get_items::get_items,
                commands::mastery_tracker::get_mastery_stats::get_mastery_stats,
                commands::mastery_tracker::set_component::set_component,
                commands::mastery_tracker::set_mastery::set_mastery,

                //Task Tracker Commands
                commands::task_tracker::get_tasks::get_tasks,
                commands::task_tracker::get_task_stats::get_task_stats,
                commands::task_tracker::set_favorite::set_favorite,
                commands::task_tracker::set_task::set_task
            ]
        )
        .setup(|app| {
            let handle = app.handle().clone();

            tauri::async_runtime::block_on(async move {
                let user_pool = database::db::init_user_db(&handle).await;
                let license_pool = database::db::init_license_db(&handle).await;

                let pool_for_bg = user_pool.clone();
                let handle_for_bg = handle.clone();

                tauri::async_runtime::spawn(async move {
                    loop {
                        if let Err(e) = check_and_apply_resets(&pool_for_bg, &handle_for_bg).await {
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
