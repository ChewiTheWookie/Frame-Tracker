-- Dailies
INSERT OR IGNORE INTO task_tracker (id, name, category, current_completions, max_completions, last_reset, tags, reset_interval, location, terminal, quest_required, icon)
VALUES 
('login_reward', 'Collect Login Reward', 'Daily', 0, 1, '1970-01-01', '["Misc"]', 'Daily', NULL, NULL, NULL, NULL),
('craft_forma', 'Craft a Forma', 'Daily', 0, 1, '1970-01-01', '["Craft"]', '24h', 'Base of Operations', 'Foundry', NULL, NULL),
('gain_syndicate_standing', 'Gain Syndicate Standing', 'Daily', 0, 1, '1970-01-01', '["Syndicate"]', 'Daily', NULL, NULL, NULL, NULL),
('spend_syndicate_standing', 'Spend Syndicate Standing', 'Daily', 0, 1, '1970-01-01', '["Syndicate"]', 'Daily', 'Base of Operations / Any Relay', 'Syndicates', NULL, NULL),
('cephalon_simaris', 'Cephalon Simaris Standing', 'Daily', 0, 1, '1970-01-01', '["Syndicate"]', 'Daily', 'Any Relay', NULL, NULL, NULL),
('osteron', 'Ostron Standing', 'Daily', 0, 1, '1970-01-01', '["Syndicate"]', 'Daily', 'Cetus, Earth', NULL, 'Saya''s Vigil', NULL),
('the_quills', 'The Quills Standing', 'Daily', 0, 1, '1970-01-01', '["Syndicate"]', 'Daily', 'Cetus, Earth', NULL, 'The War Within', NULL),
('solaris_united', 'Solaris United Standing', 'Daily', 0, 1, '1970-01-01', '["Syndicate"]', 'Daily', 'Fortuna, Venus', NULL, 'Vox Solaris (Quest)', NULL),
('vox_solaris', 'Vox Solaris Standing', 'Daily', 0, 1, '1970-01-01', '["Syndicate"]', 'Daily', 'Fortuna, Venus', NULL, 'The War Within', NULL),
('ventkids', 'Ventkids Standing', 'Daily', 0, 1, '1970-01-01', '["Syndicate"]', 'Daily', 'Fortuna, Venus', NULL, 'Vox Solaris (Quest)', NULL),
('entrati', 'Entrati Standing', 'Daily', 0, 1, '1970-01-01', '["Syndicate"]', 'Daily', 'Necralisk, Deimos', NULL, 'Heart of Deimos', NULL),
('necraloid', 'Necraloid Standing', 'Daily', 0, 1, '1970-01-01', '["Syndicate"]', 'Daily', 'Necralisk, Deimos', NULL, 'The War Within', NULL),
('the_holdfasts', 'The Holdfasts Standing', 'Daily', 0, 1, '1970-01-01', '["Syndicate"]', 'Daily', 'Chrysalith, Zariman', NULL, 'Angels of the Zariman', NULL),
('cavia', 'Cavia Standing', 'Daily', 0, 1, '1970-01-01', '["Syndicate"]', 'Daily', 'Sanctum Anatomica, Deimos', NULL, 'Whispers in the Walls', NULL),
('the_hex', 'The Hex Standing', 'Daily', 0, 1, '1970-01-01', '["Syndicate"]', 'Daily', 'Höllvania Central Mall', NULL, 'The Hex (Quest)', NULL),
('dark_sector', 'Dark Sector Mission', 'Daily', 0, 1, '1970-01-01', '["Mission"]', 'Daily', 'Base of Operations', 'Navigation', 'Double Credit Mission', NULL),
('sortie', 'Sortie', 'Daily', 0, 1, '1970-01-01', '["Mission"]', 'Daily_17', 'Base of Operations', 'Navigation', 'The War Within', NULL),
('focus', 'Focus', 'Daily', 0, 1, '1970-01-01', '["Misc"]', 'Daily', NULL, NULL, 'The Second Dream', NULL),
('sp_incursions', 'Steel Path Incursions', 'Daily', 0, 1, '1970-01-01', '["Mission"]', 'Daily', NULL, NULL, 'Steel Path unlocked', NULL),
('acrithis_daily', 'Acrithis Daily Offerings', 'Daily', 0, 1, '1970-01-01', '["Trade"]', 'Daily', 'Duviri, Dormizon', 'Acrithis', NULL, NULL),
('ticker', 'Ticker Offerings', 'Daily', 0, 1, '1970-01-01', '["Trade"]', 'Daily', 'Fortuna, Venus', 'Ticker', 'Rising Tide & Command Intrinsics 1', NULL),
('marie', 'Marie Offerings', 'Daily', 0, 1, '1970-01-01', '["Trade"]', 'Daily', 'La Cathédrale (Sanctum Anatomica, Deimos)', 'Marie', 'The Old Peace', NULL);

-- Weeklies
INSERT OR IGNORE INTO task_tracker (id, name, category, current_completions, max_completions, last_reset, tags, reset_interval, location, terminal, quest_required, icon)
VALUES 
('nightwave', 'Nightwave Challenges', 'Weekly', 0, 1, '1970-01-01', '["Task"]', 'Weekly', NULL, NULL, NULL, NULL),
('ayatan_hunt', 'Ayatan Treasure Hunt', 'Weekly', 0, 1, '1970-01-01', '["Mission"]', 'Weekly', 'Maroo''s Bazaar, Mars', 'Maroo', NULL, NULL),
('clem_survival', 'Help Clem', 'Weekly', 0, 1, '1970-01-01', '["Mission"]', 'Weekly', 'Any Relay', 'Darvo', 'A Man of Few Words', NULL),
('kahl_mission', 'Kahl''s Mission', 'Weekly', 0, 1, '1970-01-01', '["Mission"]', 'Weekly', 'Drifter''s Camp, Earth', 'Kahl', 'Veilbreaker', NULL),
('archon_hunt', 'Archon Hunt', 'Weekly', 0, 1, '1970-01-01', '["Mission"]', 'Weekly', 'Base of Operations', 'Navigation', 'The New War', NULL),
('circuit', 'Duviri Circuit', 'Weekly', 0, 1, '1970-01-01', '["Mission"]', 'Weekly', 'Base of Operations / Dormizone', 'Navigation', 'The Duviri Paradox', NULL),
('sp_circuit', 'Duviri Steel Path Circuit', 'Weekly', 0, 1, '1970-01-01', '["Mission"]', 'Weekly', 'Base of Operations / Dormizone', 'Navigation', 'The Duviri Paradox & Steel Path unlocked', NULL),
('netracells', 'Netracells', 'Weekly', 0, 5, '1970-01-01', '["Mission", "Search Pulse"]', 'Weekly', 'Sanctum Anatomica, Deimos', 'Tagfer', 'Whispers in the Walls', NULL),
('deep_archimedea', 'Deep Archimedea', 'Weekly', 0, 1, '1970-01-01', '["Mission", "Search Pulse"]', 'Weekly', 'Sanctum Anatomica, Deimos', 'Necraloid', 'Rank 5 Cavia', NULL),
('elite_deep_archimedea', 'Elite Deep Archimedea', 'Weekly', 0, 1, '1970-01-01', '["Mission", "Search Pulse"]', 'Weekly', 'Sanctum Anatomica, Deimos', 'Necraloid', 'Rank 5 Cavia', NULL),
('elite_temporal_archimedea', 'Elite Temporal Archimedea', 'Weekly', 0, 1, '1970-01-01', '["Mission", "Search Pulse"]', 'Weekly', 'Höllvania Central Mall', 'Kaya', 'Rank 5 The Hex', NULL),
('1999_calander', '1999 Calander', 'Weekly', 0, 1, '1970-01-01', '["Task"]', 'Weekly', 'Base of Operations', 'POM-2 PC', 'The Hex', NULL),
('helminth_invigorations', 'Helminth Invigorations', 'Weekly', 0, 1, '1970-01-01', '["Misc"]', 'Weekly', 'Base of Operations', 'Helminth', 'Rank 5 Entrati', NULL),
('the_descendia', 'The Descendia', 'Weekly', 0, 1, '1970-01-01', '["Mission"]', 'Weekly', 'Dark Refractory (Base of Operations)', 'Navigation', NULL, NULL),
('sp_the_descendia', 'The Descendia Steel Path', 'Weekly', 0, 1, '1970-01-01', '["Mission"]', 'Weekly', 'Dark Refractory (Base of Operations)', 'Navigation', NULL, NULL),
('paladino', 'Paladino Offerings', 'Weekly', 0, 1, '1970-01-01', '["Trade"]', 'Weekly', 'Iron Wake, Earth', 'Paladino', 'The Chains of Harrow', NULL),
('yonta', 'Yonta Offerings', 'Weekly', 0, 1, '1970-01-01', '["Trade"]', 'Weekly', 'Chrysalith, Zariman', 'Yonta', 'Angels of the Zariman', NULL),
('acrithis_weekly', 'Acrithis Weekly Offerings', 'Weekly', 0, 1, '1970-01-01', '["Trade"]', 'Weekly', 'Duviri, Dormizon', 'Acrithis', 'The Duviri Paradox', NULL),
('teshin', 'Teshin Offerings', 'Weekly', 0, 1, '1970-01-01', '["Trade"]', 'Weekly', 'Any Relay', 'Teshin', 'Steel Path unlocked', NULL),
('bird_3', 'Bird 3 Offerings', 'Weekly', 0, 1, '1970-01-01', '["Trade"]', 'Weekly', 'Sanctum Anatomica, Deimos', 'Bird 3', 'Rank 5 Cavia', NULL),
('nightcap', 'Nightcap Offerings', 'Weekly', 0, 1, '1970-01-01', '["Trade"]', 'Weekly', 'Fortuna, Venus', 'Nightcap', 'The New War', NULL);

-- Other / Rotating
INSERT OR IGNORE INTO task_tracker (id, name, category, current_completions, max_completions, last_reset, tags, reset_interval, location, terminal, quest_required, icon)
VALUES 
('baro', 'Baro Ki''Tieer', 'Other', 0, 1, '1970-01-01', '["Trade"]', 'baro', 'Relay with Symbol', 'Baro Ki''Tieer', NULL, NULL),
('mend_the_family', 'Mend The Family', 'Other', 0, 1, '1970-01-01', '["Trade"]', '8h_world', 'Necralisk, Deimos', 'Grandmother', 'Heart of Deimos', NULL),
('voidplume_trade', 'Trade For Voidplumes', 'Other', 0, 1, '1970-01-01', '["Trade"]', '8h_world', 'Chrysalith, Zariman', 'Yonta', 'Angels of the Zariman', NULL),
('voca_trade', 'Trade For Voca', 'Other', 0, 1, '1970-01-01', '["Trade"]', '8h_world', 'Sanctum Anatomica, Deimos', 'Loid', 'Whispers in the Walls', NULL);