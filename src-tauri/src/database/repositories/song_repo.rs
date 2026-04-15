use sqlx::{ SqlitePool, Result };

pub async fn add_song(pool: &SqlitePool, name: &str, song_string: &str) -> Result<i64> {
    let result = sqlx
        ::query("INSERT INTO saved_songs (name, string) VALUES (?, ?)")
        .bind(name)
        .bind(song_string)
        .execute(pool).await?;

    Ok(result.last_insert_rowid())
}

pub async fn fetch_song_names(pool: &SqlitePool) -> Result<Vec<String>> {
    let names = sqlx::query_scalar("SELECT name FROM saved_songs").fetch_all(pool).await?;

    Ok(names)
}

pub async fn fetch_song_string(pool: &SqlitePool, name: &str) -> Result<Option<String>> {
    let song_string = sqlx
        ::query_scalar("SELECT string FROM saved_songs WHERE name = ?")
        .bind(name)
        .fetch_optional(pool).await?;

    Ok(song_string)
}
