// Dir
pub mod licenses {
    pub mod get_license_detailed;
    pub mod get_license_summaries;
}

pub mod mastery_tracker {
    pub mod get_items;
    pub mod get_mastery_stats;
    pub mod set_component;
    pub mod set_mastery;
}

pub mod profiles {
    pub mod create_profile;
    pub mod delete_profile;
    pub mod get_current_profile;
    pub mod get_profile_list;
    pub mod set_profile_name;
    pub mod switch_profile;
}

pub mod saved_songs {
    pub mod delete_song;
    pub mod get_song_details;
    pub mod get_song_names;
    pub mod set_song_name;
    pub mod set_song;
}

pub mod task_tracker {
    pub mod get_task_stats;
    pub mod get_tasks;
    pub mod set_favorite;
    pub mod set_task;
}
