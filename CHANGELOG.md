# Changelog

All notable changes to this project will be logged here

## 0.1.8

### Features

- ✨ add timer to keep track of time left before task reset with `LiveTimer.tsx`

### Bug Fixes

- 🛠️ fix `Baro Ki'Tieer` not having the correct name in `task.rs`
- 🛠️ fix cards in `Mastery Tracker` not having the proper linear gradient
- 🛠️ fix tasks not reseting
- 🛠️ fix Archimedea being completeable even if 5 netracells where done

## 0.1.7

### Features

- ✨ add loading throbber in `Throbber.tsx` for `MasteryTracker.tsx`
- ✨ add Weekly Tasks tracker

### Bug Fixes

- 🛠️ fix light theme
- 🛠️ fix card button not having a hover animation

### Dev Notes

- ✏️ Replaced almost all hardcoded colors
- ✏️ Added route specific filters for `SearchBar.tsx` advanced filters

## 0.1.6

### ⚠️⚠️WARNING⚠️⚠️

- THIS BUILD WILL BREAK YOUR SAVE
- This version moves away from a .json save files for a local SQLite database
- Version `0.1.5` will no longer be supported and unfortunatly due to low download count dev time will not be spent on importing json files to SQLite

### Features

- ✨ add keyboard shortcut for focusing the search bar with either `/` or `Ctrl + F`

### Dev Notes

- ✏️ moved from `.json` storage files in the frontend to a backend `SQLite` database
- ✏️ add cach for API data fetched by `get_wiki_data` in `inventory.rs`
- ✏️ moved search from fronted to backend
- ✏️ add a maximum number of cards displayed to reduce latency with an automatic load more based on scrolling

## 0.1.5 (2026-02-28)

### Bug Fixes

- 🛠️ add `Arquebex` to the archweapon category
- 🛠️ add `Cranial Foremount` to the `resouce.rs` ignore list
- 🛠️ Fix `All` Category not showing up in `Mastery Tracker`

### Dev Notes

- ✏️ `useInventoryStore` logic was moved to `get_wiki_data` on the backend to improve performance and stability
- ✏️ `fetch_wiki_data` logic was moved to `get_wiki_data`
- ✏️ `client` is now a reuseable function for request instead of being created in each command
- ✏️ `inventory.ts` and other type files associated with `useInventoryStore` have been moved to the backend under the `models` folder
- ✏️ `Daily`'s and anything associated with that where removed due to the poor implementation, might come back in the future
