#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MasteryFilters {
    pub non_primes_only: bool,
    pub primes_only: bool,
    pub hide_fed: bool,
    pub hide_owned: bool,
    pub hide_unowned: bool,
    pub craftable_only: bool,
    pub owned_only: bool,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WeeklyFilters {
    pub hide_completed: bool,
    pub hide_incompleted: bool,
    pub hide_mission: bool,
    pub hide_trade: bool,
    pub hide_craft: bool,
    pub hide_syndicate: bool,
    pub hide_search_pulse: bool,
    pub hide_task: bool,
    pub hide_misc: bool,
}
