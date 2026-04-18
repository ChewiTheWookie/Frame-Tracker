use crate::database::db::UserDb;
use crate::database::repositories::mastery_repo;
use crate::models::database::filters::MasteryFilters;
use crate::models::database::item::Item;
use tauri::State;

#[tauri::command]
pub async fn get_items(
    state: State<'_, UserDb>,
    category: String,
    search: String,
    filters: MasteryFilters,
    limit: i64,
    offset: i64,
) -> Result<Vec<Item>, String> {
    let pool_guard = state.0.lock().await;

    let items =
        mastery_repo::find_all_items(&*pool_guard, &category, &search, &filters, limit, offset)
            .await
            .map_err(|e| e.to_string())?;

    Ok(items)
}
