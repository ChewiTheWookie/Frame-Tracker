use sqlx::{Result, SqlitePool};

pub async fn add_song(pool: &SqlitePool, name: &str, song_string: &str) -> Result<i64> {
    let result = sqlx::query("INSERT INTO saved_songs (name, string) VALUES (?, ?)")
        .bind(name)
        .bind(song_string)
        .execute(pool)
        .await?;

    Ok(result.last_insert_rowid())
}

pub async fn fetch_song_names(
    pool: &SqlitePool,
    search: &str,
    limit: i64,
    offset: i64,
) -> Result<Vec<String>> {
    let search_pattern = format!("%{}%", search);

    let names: Vec<String> = sqlx::query_scalar(
        "SELECT name FROM saved_songs 
         WHERE name LIKE ? 
         ORDER BY name ASC 
         LIMIT ? OFFSET ?",
    )
    .bind(&search_pattern)
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    Ok(names)
}

pub async fn fetch_song_string(pool: &SqlitePool, name: &str) -> Result<Option<String>> {
    let song_string = sqlx::query_scalar("SELECT string FROM saved_songs WHERE name = ?")
        .bind(name)
        .fetch_optional(pool)
        .await?;

    Ok(song_string)
}

pub async fn rename_song(pool: &SqlitePool, old_name: &str, new_name: &str) -> Result<()> {
    sqlx::query("UPDATE saved_songs SET name = ? WHERE name = ?")
        .bind(new_name)
        .bind(old_name)
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn delete_song(pool: &SqlitePool, name: &str) -> Result<()> {
    sqlx::query("DELETE FROM saved_songs WHERE name = ?")
        .bind(name)
        .execute(pool)
        .await?;

    Ok(())
}
