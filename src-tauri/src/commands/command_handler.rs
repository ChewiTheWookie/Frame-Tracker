use tauri::ipc::Invoke;

use crate::commands::{ keybinds, licenses, mastery_tracker, profiles, saved_songs, task_tracker };

pub fn generate_handler() -> impl Fn(Invoke<tauri::Wry>) -> bool {
    tauri::generate_handler![
        // Keybind Commands
        keybinds::get_keybinds::get_keybinds,
        keybinds::set_keybind::set_keybind,

        // License Commands
        licenses::get_license_details::get_license_details,
        licenses::get_license_names::get_license_names,

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
}
