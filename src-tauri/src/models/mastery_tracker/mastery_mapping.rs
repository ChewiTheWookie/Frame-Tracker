pub struct CategoryDefinition {
    pub name: &'static str,
    pub keywords: &'static [&'static str],
}

pub const CATEGORIES: &[CategoryDefinition] = &[
    CategoryDefinition {
        name: "Modular",
        keywords: &["/InfKitGun/", "/Barrel/", "/OperatorAmplifiers/", "/Tip/", "/DrifterPistol"],
    },

    CategoryDefinition {
        name: "Arch Weapons",
        keywords: &[
            "/Archwing/Primary",
            "/Archwing/Melee",
            "/HeavyWeapons/",
            "/ExaltedArtilleryWeapon",
        ],
    },

    CategoryDefinition {
        name: "Vehicles",
        keywords: &["/Powersuits/Archwing/", "/Vehicles/", "Voidrig", "Bonewidow"],
    },

    CategoryDefinition {
        name: "Companions",
        keywords: &["/Sentinels/", "/Pets/", "/CatbrowPet/", "/KubrowPet/"],
    },

    CategoryDefinition {
        name: "Warframes",
        keywords: &["/Powersuits/"],
    },

    CategoryDefinition {
        name: "Secondary",
        keywords: &[
            "/Pistols/",
            "/Secondary/",
            "/Secondaries/",
            "Pistol",
            "Akimbo",
            "Kunai",
            "/Grimoire/",
            "/ThrowingWeapons/",
            "Detron",
            "MK1Furis",
            "EntratiWristGun",
            "TwinGrakatas",
        ],
    },

    CategoryDefinition {
        name: "Melee",
        keywords: &[
            "/Melee/",
            "/Blade/",
            "Sword",
            "/LasGooSickle",
            "EntSphereHammer",
            "MK1Bo",
            "MK1Furax",
            "Skana",
            "ElectroProd",
            "EntFistIncarnon",
            "SentJointedScytheWeapon",
        ],
    },

    CategoryDefinition {
        name: "Primary",
        keywords: &["/Weapons/"],
    },
];
