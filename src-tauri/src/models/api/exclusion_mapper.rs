pub struct ItemExclusion;

impl ItemExclusion {
    pub fn should_exclude(item_name: &str, item_id: &str) -> bool {
        match item_name {
            "Some Bugged Item" => {
                return true;
            }
            _ => {}
        }

        match item_id {
            "/Lotus/Weapons/Tenno/Grimoire/TnDoppelgangerGrimoire" => true,

            _ => false,
        }
    }
}
