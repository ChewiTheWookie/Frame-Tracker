import { invoke } from "@tauri-apps/api/core";

export const songService = {
    getSongNames: (): Promise<string[]> => invoke<string[]>("get_song_names"),

    getSongDetails: (name: string): Promise<string | null> =>
        invoke<string | null>("get_song_details", { name }),

    setSong: (name: string, songString: string): Promise<void> =>
        invoke("set_song", { name, songString }),

    renameSong: (oldName: string, newName: string): Promise<void> =>
        invoke("set_song_name", { oldName, newName }),

    deleteSong: (name: string): Promise<void> =>
        invoke("delete_song", { name }),
};
