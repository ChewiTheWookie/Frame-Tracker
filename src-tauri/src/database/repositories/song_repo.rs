use sqlx::{ Result, SqlitePool };
use tauri_plugin_log::log::{ debug, error, info };

pub async fn add_song(pool: &SqlitePool, name: &str, song_string: &str) -> Result<i64> {
    debug!("add_song | Name: {}", name);

    let result = sqlx
        ::query("INSERT INTO saved_songs (name, string) VALUES (?, ?)")
        .bind(name)
        .bind(song_string)
        .execute(pool).await
        .map_err(|e| {
            error!("Failed to add song '{}': {}", name, e);
            e
        })?;

    let id = result.last_insert_rowid();
    info!("Successfully added song '{}' with rowid: {}", name, id);
    Ok(id)
}

pub async fn fetch_song_names(
    pool: &SqlitePool,
    search: &str,
    limit: i64,
    offset: i64
) -> Result<Vec<String>> {
    debug!("fetch_song_names | search: '{}' | limit: {} | offset: {}", search, limit, offset);

    let search_pattern = format!("%{}%", search);

    let names: Vec<String> = sqlx
        ::query_scalar(
            "SELECT name FROM saved_songs 
         WHERE name LIKE ? 
         ORDER BY name ASC 
         LIMIT ? OFFSET ?"
        )
        .bind(&search_pattern)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool).await
        .map_err(|e| {
            error!("Failed to fetch song names with search '{}': {}", search, e);
            e
        })?;

    debug!("Retrieved {} song names", names.len());
    Ok(names)
}

pub async fn fetch_song_string(pool: &SqlitePool, name: &str) -> Result<Option<String>> {
    debug!("fetch_song_string | Name: {}", name);

    let song_string = sqlx
        ::query_scalar("SELECT string FROM saved_songs WHERE name = ?")
        .bind(name)
        .fetch_optional(pool).await
        .map_err(|e| {
            error!("Failed to fetch song string for '{}': {}", name, e);
            e
        })?;

    if song_string.is_some() {
        debug!("Found string for song: {}", name);
    } else {
        debug!("No string found for song: {}", name);
    }

    Ok(song_string)
}

pub async fn rename_song(pool: &SqlitePool, old_name: &str, new_name: &str) -> Result<()> {
    info!("rename_song | '{}' -> '{}'", old_name, new_name);

    sqlx
        ::query("UPDATE saved_songs SET name = ? WHERE name = ?")
        .bind(new_name)
        .bind(old_name)
        .execute(pool).await
        .map_err(|e| {
            error!("Failed to rename song from '{}' to '{}': {}", old_name, new_name, e);
            e
        })?;

    Ok(())
}

pub async fn delete_song(pool: &SqlitePool, name: &str) -> Result<()> {
    info!("delete_song | Name: {}", name);

    sqlx
        ::query("DELETE FROM saved_songs WHERE name = ?")
        .bind(name)
        .execute(pool).await
        .map_err(|e| {
            error!("Failed to delete song '{}': {}", name, e);
            e
        })?;

    Ok(())
}
