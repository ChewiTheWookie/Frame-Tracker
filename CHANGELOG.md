# Changelog

All notable changes to this project will be logged here

## 0.1.5 (2026-02-28)

### Refactor

    - `useInventoryStore` logic was moved to `get_wiki_data` on the backend to improve performance and stability
    - `fetch_wiki_data` logic was moved to `get_wiki_data`
    - `client` is now a reuseable function for request instead of being created in each command
    - `inventory.ts` and other type files associated with `useInventoryStore` have been moved to the backend under the `models` folder

### Bug Fixes

    - add `Arquebex` to the archweapon category
    - add `Cranial Foremount` to the `resouce.rs` ignore list

### Other

    - `Daily`'s and anything associated with that where removed due to the poor implementation, might come back in the future
