ALTER TABLE task_tracker ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0;

UPDATE task_tracker
SET reset_interval = '23h'
WHERE id = 'craft_forma' 
  AND reset_interval = '24h';