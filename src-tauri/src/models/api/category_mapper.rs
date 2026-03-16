pub struct CategoryMapper;

impl CategoryMapper {
    pub fn get_ui_category(api_cat: &str, item_name: &str, item_id: &str) -> Option<String> {
        let name_override = match item_name {
            "Bonewidow" | "Voidrig" => Some("Vehicles"),

            "Arquebex" => Some("Arch Weapons"),

            _ => None,
        };

        if let Some(cat) = name_override {
            return Some(cat.to_string());
        }

        let id_override = match item_id {
            id if id.contains("/SentinelWeapons/") => Some("Companions"),
            id if id.contains("/MoaPetComponents/") => Some("Companions"),
            id if id.contains("/ZanukaPetMelee") => Some("Companions"),

            id if id.contains("/Hoverboard/") => Some("Vehicles"),

            id if id.contains("/ModularMelee") => Some("Modular"),
            id if id.contains("/DrifterPistol/") => Some("Modular"),
            id if id.contains("ModularSecondary") => Some("Modular"),

            id if id.contains("/OperatorAmplifiers/") => Some("Modular"),

            _ => None,
        };

        if let Some(cat) = id_override {
            return Some(cat.to_string());
        }

        let standard_map = match api_cat {
            "Warframes" => Some("Warframes"),
            "Arch-Gun" | "Arch-Melee" => Some("Arch Weapons"),
            "Primary" => Some("Primary"),
            "Secondary" => Some("Secondary"),
            "Melee" => Some("Melee"),
            "Archwing" => Some("Vehicles"),
            "Pets" | "Sentinels" => Some("Companions"),
            _ => None,
        };

        standard_map.map(|s| s.to_string())
    }
}
