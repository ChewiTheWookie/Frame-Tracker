CREATE TABLE IF NOT EXISTS mastery_tracker (
    id TEXT PRIMARY KEY,
    mastered BOOLEAN NOT NULL DEFAULT 0,
    helminthed BOOLEAN NOT NULL DEFAULT 0,
    owned BOOLEAN NOT NULL DEFAULT 0,
    craftable BOOLEAN NOT NULL DEFAULT 0,
    parts_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS task_tracker (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    current_completions INTEGER NOT NULL DEFAULT 0,
    max_completions INTEGER NOT NULL DEFAULT 1,
    last_reset TEXT NOT NULL,
    tags TEXT,
    reset_interval TEXT,
    location TEXT,
    terminal TEXT,
    quest_required TEXT,
    icon TEXT
);

CREATE TABLE IF NOT EXISTS mastery_tracker_new (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'Unknown',
    craftable BOOLEAN NOT NULL DEFAULT 0,
    owned BOOLEAN NOT NULL DEFAULT 0,
    mastered BOOLEAN NOT NULL DEFAULT 0,
    helminthed BOOLEAN NOT NULL DEFAULT 0,
    img_path TEXT
);

INSERT OR IGNORE INTO mastery_tracker_new (id, craftable, owned, mastered, helminthed)
SELECT id, craftable, owned, mastered, helminthed FROM mastery_tracker;

DROP TABLE IF EXISTS mastery_tracker_backup;
ALTER TABLE mastery_tracker RENAME TO mastery_tracker_backup;
ALTER TABLE mastery_tracker_new RENAME TO mastery_tracker;

CREATE TABLE IF NOT EXISTS item_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT NOT NULL,
    component_name TEXT NOT NULL,
    needed_quantity INTEGER NOT NULL DEFAULT 1,
    owned_quantity INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (item_id) REFERENCES mastery_tracker(id) ON DELETE CASCADE,
    UNIQUE(item_id, component_name) ON CONFLICT ABORT,
    CONSTRAINT quantity_bounds CHECK (owned_quantity >= 0 AND owned_quantity <= needed_quantity)
);

CREATE TRIGGER IF NOT EXISTS update_craftable_after_component_change
AFTER UPDATE OF owned_quantity ON item_components
BEGIN
    UPDATE mastery_tracker
    SET craftable = (
        NOT EXISTS (
            SELECT 1 
            FROM item_components 
            WHERE item_id = NEW.item_id 
            AND owned_quantity < needed_quantity
        )
    )
    WHERE id = NEW.item_id;
END;

CREATE TRIGGER IF NOT EXISTS consume_components_on_owned
AFTER UPDATE OF owned ON mastery_tracker
FOR EACH ROW
WHEN NEW.owned = 1 AND OLD.owned = 0
BEGIN
    UPDATE item_components
    SET owned_quantity = 0
    WHERE item_id = NEW.id;
END;

CREATE INDEX idx_components_item_id ON item_components(item_id);
CREATE INDEX idx_tracker_category ON mastery_tracker(category);

DROP TABLE IF EXISTS weekly_tasks;