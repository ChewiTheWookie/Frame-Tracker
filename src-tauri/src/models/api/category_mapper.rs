pub fn get_category_map(api_cat: &str, item_name: &str, item_id: &str) -> Option<&'static str> {
    match item_name {
        "Bonewidow" | "Voidrig" => {
            return Some("Vehicles");
        }
        "Arquebex" => {
            return Some("Arch Weapons");
        }
        _ => {}
    }

    match item_id {
        id if id.contains("/SentinelWeapons/")
            || id.contains("/MoaPetComponents/")
            || id.contains("/ZanukaPetMelee") =>
        {
            return Some("Companions");
        }

        id if id.contains("/Hoverboard/") => {
            return Some("Vehicles");
        }

        id if id.contains("/ModularMelee")
            || id.contains("/DrifterPistol/")
            || id.contains("ModularSecondary")
            || id.contains("/OperatorAmplifiers/") =>
        {
            return Some("Modular");
        }

        _ => {}
    }

    match api_cat {
        "Warframes" => Some("Warframes"),
        "Arch-Gun" | "Arch-Melee" => Some("Arch Weapons"),
        "Primary" => Some("Primary"),
        "Secondary" => Some("Secondary"),
        "Melee" => Some("Melee"),
        "Archwing" => Some("Vehicles"),
        "Pets" | "Sentinels" => Some("Companions"),
        _ => None,
    }
}
