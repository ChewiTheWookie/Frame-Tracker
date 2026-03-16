#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MasteryStats {
    pub current: i32,
    pub total: i32,
    pub helminth_current: i32,
    pub helminth_total: i32,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskStats {
    pub current: i32,
    pub total: i32,
}
