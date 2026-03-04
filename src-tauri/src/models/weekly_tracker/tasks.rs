use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
#[sqlx(rename_all = "snake_case")]
pub struct WeeklyTask {
    pub id: String,
    pub name: String,
    pub category: String,
    pub current_completions: i32,
    pub max_completions: i32,
    pub last_reset: String,
    pub tags: Option<String>,
    pub reset_interval: Option<String>,
    pub location: Option<String>,
    pub terminal: Option<String>,
    pub quest_required: Option<String>,
    pub icon: Option<String>,
}

//prettier-ignore
pub const DEFAULT_WEEKLY_TASKS: &[
    (
        &str,
        &str,
        &str,
        i32,
        i32,
        Option<&str>,
        Option<&str>,
        Option<&str>,
        Option<&str>,
        Option<&str>,
        Option<&str>,
    )
] = &[
    // ? Key, Name, Category, Current Completion, Max Completion, Last Reset, Tags, Reset Interval, Location, Terminal, Quest Required, Icon

    // Daily
    ("login_reward", "Collect Login Reward", "Daily", 0, 1, Some("[\"Misc\"]"), None, None, None, None, None,),
    ("craft_forma", "Craft a Forma", "Daily", 0, 1, Some("[\"Craft\"]"), None, Some("Base of Operations"), Some("Foundry"), None, None,),
    ("gain_syndicate_standing", "Gain Syndicate Standing", "Daily", 0, 1, Some("[\"Syndicate\"]"), None, None, None, None, None,),
    ("spend_syndicate_standing", "Spend Syndicate Standing", "Daily", 0, 1, Some("[\"Syndicate\"]"), None, Some("Base of Operations / Any Relay"), Some("Syndicates"), None, None,),
    ("cephalon_simaris", "Cephalon Simaris Standing", "Daily", 0, 1, Some("[\"Syndicate\"]"), None, Some("Any Relay"), None, None, None,),
    ("osteron", "Ostron Standing", "Daily", 0, 1, Some("[\"Syndicate\"]"), None, Some("Cetus, Earth"), None, Some("Saya's Vigil"), None,),
    ("the_quills", "The Quills Standing", "Daily", 0, 1, Some("[\"Syndicate\"]"), None, Some("Cetus, Earth"), None, Some("The War Within"), None,),
    ("solaris_united", "Solaris United Standing", "Daily", 0, 1, Some("[\"Syndicate\"]"), None, Some("Fortuna, Venus"), None, Some("Vox Solaris (Quest)"), None,),
    ("vox_solaris", "Vox Solaris Standing", "Daily", 0, 1, Some("[\"Syndicate\"]"), None, Some("Fortuna, Venus"), None, Some("The War Within"), None,),
    ("ventkids", "Ventkids Standing", "Daily", 0, 1, Some("[\"Syndicate\"]"), None, Some("Fortuna, Venus"), None, Some("Vox Solaris (Quest)"), None,),
    ("entrati", "Entrati Standing", "Daily", 0, 1, Some("[\"Syndicate\"]"), None, Some("Necralisk, Deimos"), None, Some("Heart of Deimos"), None,),
    ("necraloid", "Necraloid Standing", "Daily", 0, 1, Some("[\"Syndicate\"]"), None, Some("Necralisk, Deimos"), None, Some("The War Within"), None,),
    ("the_holdfasts", "The Holdfasts Standing", "Daily", 0, 1, Some("[\"Syndicate\"]"), None, Some("Chrysalith, Zariman"), None, Some("Angels of the Zariman"), None,),
    ("cavia", "Cavia Standing", "Daily", 0, 1, Some("[\"Syndicate\"]"), None, Some("Sanctum Anatomica, Deimos"), None, Some("Whispers in the Walls"), None,),
    ("the_hex", "The Hex Standing", "Daily", 0, 1, Some("[\"Syndicate\"]"), None, Some("Höllvania Central Mall"), None, Some("The Hex (Quest)"), None,),
    ("dark_sector", "Dark Sector Mission", "Daily", 0, 1, Some("[\"Mission\"]"), None, Some("Base of Operations"), Some("Navigation"), Some("Double Credit Mission"), None,),
    ("sortie", "Sortie", "Daily", 0, 1, Some("[\"Mission\"]"), None, Some("Base of Operations"), Some("Navigation"), Some("The War Within"), None),
    ("focus", "Focus", "Daily", 0, 1, Some("[\"Misc\"]"), None, None, None, Some("The Second Dream"), None),
    ("sp_incursions", "Steel Path Incursions", "Daily", 0, 1, Some("[\"Mission\"]"), None, None, None, Some("Steel Path unlocked"), None),
    ("acrithis_daily", "Acrithis Daily Offerings", "Daily", 0, 1, Some("[\"Trade\"]"), None, Some("Duviri, Dormizon"), Some("Acrithis"), None, None),
    ("ticker", "Ticker Offerings", "Daily", 0, 1, Some("[\"Trade\"]"), None, Some("Fortuna, Venus"), Some("Ticker"), Some("Rising Tide & Command Intrinsics 1"), None),
    ("marie", "Marie Offerings", "Daily", 0, 1, Some("[\"Trade\"]"), None, Some(" La Cathédrale (Sanctum Anatomica, Deimos)"), Some("Marie"), Some("The Old Peace"), None),

    // Weekly
    ("nightwave", "Nightwave Challenges", "Weekly", 0, 1, Some("[\"Task\"]"), None, None, None, None, None,),
    ("ayatan_hunt", "Ayatan Treasure Hunt", "Weekly", 0, 1, Some("[\"Mission\"]"), None, Some("Maroo's Bazaar, Mars"), Some("Maroo"), None, None,),
    ("clem_survival", "Help Clem", "Weekly", 0, 1, Some("[\"Mission\"]"), None, Some("Any Relay"), Some("Darvo"), Some("A Man of Few Words"), None,),
    ("kahl_mission", "Kahl's Mission", "Weekly", 0, 1, Some("[\"Mission\"]"), None, Some("Drifter's Camp, Earth"), Some("Kahl"), Some("Veilbreaker"), None,),
    ("archon_hunt", "Archon Hunt", "Weekly", 0, 1, Some("[\"Mission\"]"), None, Some("Base of Operations"), Some("Navigation"), Some("The New War"), None,),
    ("circuit", "Duviri Circuit", "Weekly", 0, 1, Some("[\"Mission\"]"), None, Some("Base of Operations / Dormizone"), Some("Navigation"), Some("The Duviri Paradox"), None),
    ("sp_circuit", "Duviri Steel Path Circuit", "Weekly", 0, 1, Some("[\"Mission\"]"), None, Some("Base of Operations / Dormizone"), Some("Navigation"), Some("The Duviri Paradox & Steel Path unlocked"), None,),
    ("netracells", "Netracells", "Weekly", 0, 5, Some("[\"Mission\", \"Search Pulse\"]"), None, Some("Sanctum Anatomica, Deimos"), Some("Tagfer"), Some("Whispers in the Walls"), None,),
    ("deep_archimedea", "Deep Archimedea", "Weekly", 0, 1, Some("[\"Mission\", \"Search Pulse\"]"), None, Some("Sanctum Anatomica, Deimos"), Some("Necraloid"), Some("Rank 5 Cavia"), None,),
    ("elite_deep_archimedea", "Elite Deep Archimedea", "Weekly", 0, 1, Some("[\"Mission\", \"Search Pulse\"]"), None, Some("Sanctum Anatomica, Deimos"), Some("Necraloid"), Some("Rank 5 Cavia"), None,),
    ("elite_temporal_archimedea", "Elite Temporal Archimedea", "Weekly", 0, 1, Some("[\"Mission\", \"Search Pulse\"]"), None, Some("Höllvania Central Mall"), Some("Kaya"), Some("Rank 5 The Hex"), None,),
    ("1999_calander", "1999 Calander", "Weekly", 0, 1, Some("[\"Task\"]"), None, Some("Base of Operations"), Some("POM-2 PC"), Some("The Hex"), None),
    ("helminth_invigorations", "Helminth Invigorations", "Weekly", 0, 1, Some("[\"Misc\"]"), None, Some("Base of Operations"), Some("Helminth"), Some("Rank 5 Entrati"), None),
    ("the_descendia", "The Descendia", "Weekly", 0, 1, Some("[\"Mission\"]"), None, Some("Dark Refractory (Base of Operations)"), Some("Navigation"), None, None),
    ("sp_the_descendia", "The Descendia Steel Path", "Weekly", 0, 1, Some("[\"Mission\"]"), None, Some("Dark Refractory (Base of Operations)"), Some("Navigation"), None, None),
    ("paladino", "Paladino Offerings", "Weekly", 0, 1, Some("[\"Trade\"]"), None, Some("Iron Wake, Earth"), Some("Paladino"), Some("The Chains of Harrow"), None),
    ("yonta", "Yonta Offerings", "Weekly", 0, 1, Some("[\"Trade\"]"), None, Some("Chrysalith, Zariman"), Some("Yonta"), Some("Angels of the Zariman"), None),
    ("acrithis_weekly", "Acrithis Weekly Offerings", "Daily", 0, 1, Some("[\"Trade\"]"), None, Some("Duviri, Dormizon"), Some("Acrithis"), Some("The Duviri Paradox"), None),
    ("teshin", "Teshin Offerings", "Weekly", 0, 1, Some("[\"Trade\"]"), None, Some("Any Relay"), Some("Teshin"), Some("Steel Path unlocked"), None),
    ("bird_3", "Bird 3 Offerings", "Weekly", 0, 1, Some("[\"Trade\"]"), None, Some("Sanctum Anatomica, Deimos"), Some("Bird 3"), Some("Rank 5 Cavia"), None),
    ("nightcap", "Nightcap Offerings", "Weekly", 0, 1, Some("[\"Trade\"]"), None, Some("Fortuna, Venus"), Some("Nightcap"), Some("The New War"), None),

    // Other
    ("baro", "Trade For Voca", "Other", 0, 1, Some("[\"Trade\"]"), Some("14d"), Some("Relay with Symbol"), Some("Baro Ki'Tieer"), None, None,),
    ("mend_the_family", "Mend The Family", "Other", 0, 1, Some("[\"Trade\"]"), Some("8h_world"), Some("Necralisk, Deimos"), Some("Grandmother"), Some("Heart of Deimos"), None,),
    ("voidplume_trade", "Trade For Voidplumes", "Other", 0, 1, Some("[\"Trade\"]"), Some("8h_world"), Some("Chrysalith, Zariman"), Some("Yonta"), Some("Angels of the Zariman"), None,),
    ("voca_trade", "Trade For Voca", "Other", 0, 1, Some("[\"Trade\"]"), Some("8h_world"), Some("Sanctum Anatomica, Deimos"), Some("Loid"), Some("Whispers in the Walls"), None,),
];
