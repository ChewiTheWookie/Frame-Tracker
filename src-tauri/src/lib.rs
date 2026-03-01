use crate::database::{ DbState, init_db };
use tauri::Manager;

mod api;
mod database;
mod commands;
mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder
        ::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().expect("failed to get app data dir");
            std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");

            let pool = tauri::async_runtime::block_on(async { init_db(app_data_dir).await });
            app.manage(DbState { pool });

            Ok(())
        })
        .invoke_handler(
            tauri::generate_handler![
                commands::fetch_wiki_data::fetch_wiki_data,
                commands::mastery_db::save_item_progress,
                commands::mastery_db::get_all_user_progress
            ]
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
