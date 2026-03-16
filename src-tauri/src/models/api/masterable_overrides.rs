pub struct MasterableOverrides;

impl MasterableOverrides {
    pub fn is_force_masterable(item_name: &str, item_id: &str) -> bool {
        match item_name {
            "Arquebex" | "Mote Prism" => {
                return true;
            }
            _ => {}
        }

        match item_id {
            id if id.contains("/OperatorAmplifiers/") & id.contains("/Barrel/") => true,
            _ => false,
        }
    }
}
