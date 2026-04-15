import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

export interface ProfileService {
    list: () => Promise<string[]>;
    create: (name: string) => Promise<void>;
    switch: (name: string) => Promise<void>;
    onSwitch: (callback: (name: string) => void) => Promise<UnlistenFn>;
    getCurrent: () => Promise<string>;
    rename: (oldName: string, newName: string) => Promise<void>;
    delete: (name: string) => Promise<void>;
}

export const profileService: ProfileService = {
    list: () => invoke("get_profile_list"),
    create: (name: string) => invoke("create_profile", { name }),
    switch: (name: string) =>
        invoke("switch_profile", { newProfileName: name }),
    onSwitch: (callback) => {
        return listen<string>("profile-switched", (event) =>
            callback(event.payload),
        );
    },
    getCurrent: () => invoke("get_current_profile"),
    rename: (oldName, newName) =>
        invoke("set_profile_name", { oldName, newName }),
    delete: (name) => invoke("delete_profile", { name }),
};
