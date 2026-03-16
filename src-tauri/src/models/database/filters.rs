#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MasteryFilters {
    pub hide_non_prime: bool,
    pub hide_prime: bool,
    pub hide_unowned: bool,
    pub hide_craftable: bool,
    pub hide_owned: bool,
    pub hide_mastered: bool,
    pub hide_helminthed: bool,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskFilters {
    pub hide_incomplete: bool,
    pub hide_complete: bool,
}
