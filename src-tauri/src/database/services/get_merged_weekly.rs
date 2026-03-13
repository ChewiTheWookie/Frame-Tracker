use crate::database::services::weekly_service;
use crate::models::weekly_tracker::tasks::WeeklyTask;
use crate::models::filters::WeeklyFilters;
use sqlx::SqlitePool;

pub async fn get_merged_weekly(
    pool: &SqlitePool,
    search: String,
    active_category: String,
    filters: WeeklyFilters
) -> Result<Vec<WeeklyTask>, String> {
    let all_tasks = weekly_service::get_all_weekly_tasks(pool).await.map_err(|e| e.to_string())?;

    let search_lower = search.to_lowercase();

    let filtered: Vec<WeeklyTask> = all_tasks
        .into_iter()
        .filter(|task| {
            if active_category != "All" && task.category != active_category {
                return false;
            }

            if !search_lower.is_empty() {
                let name_match = task.name.to_lowercase().contains(&search_lower);
                let loc_match = task.location
                    .as_ref()
                    .map(|l| l.to_lowercase().contains(&search_lower))
                    .unwrap_or(false);

                if !name_match && !loc_match {
                    return false;
                }
            }

            let is_done = task.current_completions >= task.max_completions;
            if filters.hide_completed && is_done {
                return false;
            }
            if filters.hide_incompleted && !is_done {
                return false;
            }

            let t_str = task.tags.as_deref().unwrap_or("").to_lowercase();

            if filters.hide_mission && t_str.contains("mission") {
                return false;
            }
            if filters.hide_trade && t_str.contains("trade") {
                return false;
            }
            if filters.hide_craft && t_str.contains("craft") {
                return false;
            }
            if filters.hide_syndicate && t_str.contains("syndicate") {
                return false;
            }
            if filters.hide_search_pulse && t_str.contains("search pulse") {
                return false;
            }
            if filters.hide_task && t_str.contains("task") {
                return false;
            }
            if filters.hide_misc && t_str.contains("misc") {
                return false;
            }

            true
        })
        .collect();

    Ok(filtered)
}
