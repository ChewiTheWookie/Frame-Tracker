pub fn get_force_masterable_map(item_name: &str, item_id: &str) -> bool {
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
