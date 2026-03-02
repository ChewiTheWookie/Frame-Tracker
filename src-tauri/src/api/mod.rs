// Dir
pub mod requests {
    pub mod get_wiki_data;
    pub use get_wiki_data::get_wiki_data;
}

// Files
pub mod client;
pub use client::client;
