# Changelog

All notable changes to this project will be logged here

## 1.1.1

### Bug Fixes

- 🛠️ fix license text not being correct

### Dev Notes

- ✏️ refactor `useMasteryStore` and `useTaskStore` for improved readablility and maintainability
- ✏️ move time store useEffect from App.tsx to AppInitializer.tsx
- ✏️ add github actions to handle builds

## 1.1.0

### Features

- ✨ add favorites to `TaskCard.tsx`
- ✨ add scroll to top button
- ✨ add light theme
- ✨ add keybinds for searchbar

### Bug Fixes

- 🛠️ fix part consumption when Owned is clicked
- 🛠️ fix close button in acknowledgments page being hidden by the section header
- 🛠️ fix filters not applying until page refreshed to items that had a state change
- 🛠️ fix filter button being the same color as bg when active and hovered

### Dev Notes

- ✏️ change color of 'Exclude' log from red to cyan
- ✏️ change from emoji to lucide icon for feed button in `MasteryCard.tsx`
- ✏️ remove nested divs in `App.tsx`, `Navbar.tsx`, `MasteryTracker.tsx`, `TaskTracker.tsx`, `Searchbar.tsx`, `Statbar.tsx`

## 1.0.0

- ✨ Improved many things and fix past bugs, improved maintanability and performance

### ⚠️⚠️WARNING⚠️⚠️

- ⚠️ To use your old save file head to the `%APPDATA%` folder under `com.chewithewookie.frametracker/frametracker.db` and rename that to `user_progress.db`

## 0.1.11

### Features

- ✨ add **Lucide** icons from https://lucide.dev/
- ✨ add new Navbar
- ✨ add a Settings page
- ✨ add use System default for theme

### Bug Fixes

- 🛠️ fix `Acknowledgments.tsx` style
- 🛠️ fix Category tab switching causing stutter

### Dev Notes

- ✏️ move scripts from `package.json` to `scripts/`
- ✏️ change to `useRoutes()` in `App.tsx`
- ✏️ move keybind handling out of `App.tsx` to `useKeybinds.ts` hook
- ✏️ move global CSS variables from body to :root
- ✏️ add links to `README.md` for the technologies badges
- ✏️ move css var from `.dark` and `.light` to `:root` and `:root.light`
- ✏️ move store selection to `useActiveStore.ts`
- ✏️ add a version check to prevent build with same version number
- ✏️ remove nested divs in `About.tsx`
- ✏️ move scroll to top button to `ScrollToTop.tsx` and added to `About.tsx` and `WeeklyTracker.tsx` pages
- ✏️ rename About page and related to Acknowledgments
- ✏️ remove `ThemeButton.tsx` and moved theme selection to settings

## 0.1.10

### Bug Fixs

- 🛠️ fix licenses not showing

### Dev Notes

- ✏️ moved `About.tsx` logic to backend
- ✏️ add automatic sync of versions between `package.json`, `tauri.conf.json` and `cargo.toml`
- ✏️ fix prebuild running twice when running `npm run tauri build`

## 0.1.9

### Features

- ✨ add auto scroll back to top on category change
- ✨ add third-party license compliance page and automated build script

### Bug Fixes

- 🛠️ fix `.mastered.helminthed` card gradient

### Dev Notes

- ✏️ Moved category selector logic from `App.tsx` to `CategoryTabs.tsx`

## 0.1.8

### Features

- ✨ add timer to keep track of time left before task reset with `LiveTimer.tsx`

### Bug Fixes

- 🛠️ fix `Baro Ki'Tieer` not having the correct name in `task.rs`
- 🛠️ fix cards in `Mastery Tracker` not having the proper linear gradient
- 🛠️ fix tasks not reseting
- 🛠️ fix Archimedea being completeable even if 5 netracells where done

### Dev Notes

- ✏️ add `useTimeStore`

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
