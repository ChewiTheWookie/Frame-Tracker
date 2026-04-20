use crate::database::db::UserDb;
use crate::database::repositories::mastery_repo;
use crate::models::database::stats::MasteryStats;
use tauri::State;

#[tauri::command]
pub async fn get_mastery_stats(
    state: State<'_, UserDb>,
    category: String,
    filters: crate::models::database::filters::MasteryFilters
) -> Result<MasteryStats, String> {
    let pool_guard = state.0.lock().await;

    let stats = mastery_repo
        ::get_stats(&*pool_guard, &category, &filters).await
        .map_err(|e| e.to_string())?;

    Ok(stats)
}
