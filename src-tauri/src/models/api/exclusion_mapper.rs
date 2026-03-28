pub fn get_exclusion_map(item_name: &str, item_id: &str) -> bool {
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
