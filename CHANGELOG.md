# Changelog

All notable changes to this project will be logged here

## 0.1.6

### ⚠️⚠️WARNING⚠️⚠️

- THIS BUILD WILL BREAK YOUR SAVE
- This version moves away from a .json save files for a local SQLite database
- Version `0.1.5` will no longer be supported and unfortunatly due to low download count dev time will not be spent on importing json files to SQLite

### Dev Notes

- ✏️ Moved from `.json` storage files in the frontend to a backend `SQLite` database

## 0.1.5 (2026-02-28)

### Bug Fixes

- 🛠️add `Arquebex` to the archweapon category
- 🛠️ add `Cranial Foremount` to the `resouce.rs` ignore list
- 🛠️ Fix `All` Category not showing up in `Mastery Tracker`

### Dev Notes

- ✏️ `useInventoryStore` logic was moved to `get_wiki_data` on the backend to improve performance and stability
- ✏️ `fetch_wiki_data` logic was moved to `get_wiki_data`
- ✏️ `client` is now a reuseable function for request instead of being created in each command
- ✏️ `inventory.ts` and other type files associated with `useInventoryStore` have been moved to the backend under the `models` folder
- ✏️ `Daily`'s and anything associated with that where removed due to the poor implementation, might come back in the future
