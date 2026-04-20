use sqlx::{ QueryBuilder, Sqlite };
use crate::models::database::filters::TaskFilters;
use tauri_plugin_log::log::debug;

pub struct TaskQueryBuilder<'a> {
    category: &'a str,
    search: &'a str,
    filters: &'a TaskFilters,
    limit: i64,
    offset: i64,
}

impl<'a> TaskQueryBuilder<'a> {
    pub fn new(category: &'a str, search: &'a str, filters: &'a TaskFilters) -> Self {
        Self {
            category,
            search,
            filters,
            limit: 50,
            offset: 0,
        }
    }

    pub fn paginate(mut self, limit: i64, offset: i64) -> Self {
        self.limit = limit;
        self.offset = offset;
        self
    }

    pub fn build(self) -> QueryBuilder<'a, Sqlite> {
        debug!(
            "Building Task list query | Category: {} | Search: '{}'",
            self.category,
            self.search
        );

        let mut builder: QueryBuilder<Sqlite> = QueryBuilder::new(
            "SELECT * FROM task_tracker WHERE 1=1"
        );

        self.apply_filters(&mut builder);

        builder.push(" ORDER BY ");
        if self.filters.favorite_first {
            builder.push("favorite DESC, ");
        }
        builder.push("name ASC LIMIT ");
        builder.push_bind(self.limit);
        builder.push(" OFFSET ");
        builder.push_bind(self.offset);

        builder
    }

    pub fn build_stats(self) -> QueryBuilder<'a, Sqlite> {
        debug!("Building Task stats query | Category: {}", self.category);

        let mut builder: QueryBuilder<Sqlite> = QueryBuilder::new(
            r#"SELECT 
                COUNT(*), 
                CAST(COALESCE(SUM(current_completions >= max_completions), 0) AS INTEGER) 
            FROM task_tracker WHERE 1=1 "#
        );

        self.apply_filters(&mut builder);
        builder
    }

    fn apply_filters(&self, builder: &mut QueryBuilder<'a, Sqlite>) {
        if self.category != "All" {
            builder.push(" AND category = ");
            builder.push_bind(self.category);
        }

        if !self.search.is_empty() {
            let pattern = format!("%{}%", self.search);
            builder.push(" AND (name LIKE ");
            builder.push_bind(pattern.clone());
            builder.push(" OR tags LIKE ");
            builder.push_bind(pattern.clone());
            builder.push(" OR location LIKE ");
            builder.push_bind(pattern);
            builder.push(")");
        }

        if self.filters.hide_incomplete {
            builder.push(" AND current_completions >= max_completions");
        }
        if self.filters.hide_complete {
            builder.push(" AND current_completions < max_completions");
        }
        if self.filters.hide_favorite {
            builder.push(" AND favorite = 0");
        }
        if self.filters.hide_non_favorite {
            builder.push(" AND favorite = 1");
        }
    }
}
