#[derive(serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MasteryFilters {
    pub hide_non_prime: bool,
    pub hide_prime: bool,

    #[serde(default)]
    pub hide_unowned: bool,
    #[serde(default)]
    pub hide_craftable: bool,
    #[serde(default)]
    pub hide_owned: bool,
    #[serde(default)]
    pub hide_mastered: bool,
    #[serde(default)]
    pub hide_helminthed: bool,
}

#[derive(serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TaskFilters {
    #[serde(default)]
    pub hide_incomplete: bool,
    #[serde(default)]
    pub hide_complete: bool,

    #[serde(default)]
    pub favorite_first: bool,

    pub hide_favorite: bool,
    pub hide_non_favorite: bool,
}
