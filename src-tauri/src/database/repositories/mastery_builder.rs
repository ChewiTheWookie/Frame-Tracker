use sqlx::{ QueryBuilder, Sqlite };
use crate::models::database::filters::MasteryFilters;
use tauri_plugin_log::log::{ debug };

pub struct MasteryQueryBuilder<'a> {
    category: &'a str,
    search: &'a str,
    filters: &'a MasteryFilters,
    limit: i64,
    offset: i64,
}

impl<'a> MasteryQueryBuilder<'a> {
    pub fn new(category: &'a str, search: &'a str, filters: &'a MasteryFilters) -> Self {
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
            "Building Mastery list query | Category: {} | Search: '{}'",
            self.category,
            self.search
        );

        let mut builder: QueryBuilder<Sqlite> = QueryBuilder::new(
            "SELECT * FROM mastery_tracker WHERE 1=1"
        );

        self.apply_filters(&mut builder);

        builder.push(" ORDER BY name ASC LIMIT ");
        builder.push_bind(self.limit);
        builder.push(" OFFSET ");
        builder.push_bind(self.offset);

        builder
    }

    pub fn build_stats(self) -> QueryBuilder<'a, Sqlite> {
        debug!("Building Mastery stats query | Category: {}", self.category);

        let mut builder: QueryBuilder<Sqlite> = QueryBuilder::new(
            r#"SELECT 
                COUNT(*), 
                CAST(COALESCE(SUM(mastered), 0) AS INTEGER) 
            FROM mastery_tracker WHERE 1=1 "#
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
            builder.push(" AND name LIKE ");
            builder.push_bind(format!("%{}%", self.search));
        }

        if self.filters.hide_prime {
            builder.push(" AND name NOT LIKE '%Prime%'");
        }
        if self.filters.hide_non_prime {
            builder.push(" AND name LIKE '%Prime%'");
        }
        if self.filters.hide_mastered {
            builder.push(" AND mastered = 0");
        }
        if self.filters.hide_helminthed {
            builder.push(" AND helminthed = 0");
        }

        if self.filters.hide_owned {
            builder.push(" AND NOT (owned = 1 AND mastered = 0 AND helminthed = 0)");
        }
        if self.filters.hide_craftable {
            builder.push(
                " AND NOT (craftable = 1 AND owned = 0 AND mastered = 0 AND helminthed = 0)"
            );
        }
        if self.filters.hide_unowned {
            builder.push(
                " AND NOT (mastered = 0 AND owned = 0 AND craftable = 0 AND helminthed = 0)"
            );
        }
    }
}
