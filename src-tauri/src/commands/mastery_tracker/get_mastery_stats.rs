use crate::database::db::UserDb;
use crate::models::database::stats::MasteryStats;

#[tauri::command]
pub async fn get_mastery_stats(
    state: tauri::State<'_, UserDb>,
    category: String
) -> Result<MasteryStats, String> {
    let pool = &state.0;

    let mastery = sqlx
        ::query_as::<_, (i32, i32)>(
            r#"
        SELECT 
            COUNT(*), 
            CAST(COALESCE(SUM(mastered), 0) AS INTEGER) 
        FROM mastery_tracker 
        WHERE (category = ? OR ? = 'All')
        "#
        )
        .bind(&category)
        .bind(&category)
        .fetch_one(pool).await
        .map_err(|e| e.to_string())?;

    let mut h_current = 0;
    let mut h_total = 0;

    if category == "All" || category == "Warframes" {
        let helminth = sqlx
            ::query_as::<_, (i32, i32)>(
                r#"
            SELECT 
                COUNT(*), 
                CAST(COALESCE(SUM(helminthed), 0) AS INTEGER) 
            FROM mastery_tracker 
            WHERE category = 'Warframes' AND name NOT LIKE '%Prime%'
            "#
            )
            .fetch_one(pool).await
            .map_err(|e| e.to_string())?;

        h_total = helminth.0;
        h_current = helminth.1;
    }

    Ok(MasteryStats {
        current: mastery.1,
        total: mastery.0,
        helminth_current: h_current,
        helminth_total: h_total,
    })
}
