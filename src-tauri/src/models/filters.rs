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
