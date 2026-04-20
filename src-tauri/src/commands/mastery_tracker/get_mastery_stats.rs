use crate::database::db::UserDb;
use crate::database::repositories::mastery_repo;
use crate::models::database::stats::MasteryStats;
use tauri::State;
use tauri_plugin_log::log::{ debug, error };

#[tauri::command]
pub async fn get_mastery_stats(
    state: State<'_, UserDb>,
    category: String,
    filters: crate::models::database::filters::MasteryFilters
) -> Result<MasteryStats, String> {
    debug!("get_mastery_stats called | Category: {}", category);
    debug!("Stats Context Filters: {:?}", filters);

    let pool_guard = state.0.lock().await;

    let stats = mastery_repo::get_stats(&*pool_guard, &category, &filters).await.map_err(|e| {
        let err_msg = format!("Failed to calculate mastery stats for {}: {}", category, e);
        error!("{}", err_msg);
        err_msg
    })?;

    debug!(
        "Stats Result for {}: {}/{} (Helminth: {}/{})",
        category,
        stats.current,
        stats.total,
        stats.helminth_current,
        stats.helminth_total
    );

    Ok(stats)
}
