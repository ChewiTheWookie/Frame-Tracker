import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { invoke } from "@tauri-apps/api/core";

interface SongState {
    songNames: string[];
    songCache: Record<string, string>;
    isLoading: boolean;
    error: string | null;

    fetchSongNames: () => Promise<void>;
    fetchSongDetails: (name: string) => Promise<void>;
    addSong: (name: string, songString: string) => Promise<void>;
}

export const useSavedSongStore = create<SongState>((set, get) => ({
    songNames: [],
    songCache: {},
    isLoading: false,
    error: null,

    fetchSongNames: async () => {
        const { songNames, isLoading } = get();
        if (songNames.length > 0 || isLoading) return;

        set({ isLoading: true, error: null });
        try {
            const names = await invoke<string[]>("get_song_names");
            set({ songNames: names, isLoading: false });
        } catch (err) {
            console.error("Fetch song names error:", err);
            set({ error: String(err), isLoading: false });
        }
    },

    fetchSongDetails: async (name: string) => {
        if (get().songCache[name]) return;

        try {
            const songString = await invoke<string | null>("get_song_details", {
                name,
            });
            if (songString) {
                set((state) => ({
                    songCache: { ...state.songCache, [name]: songString },
                }));
            }
        } catch (err) {
            console.error(`[Songs] Detail fetch failed for ${name}:`, err);
        }
    },

    addSong: async (name: string, songString: string) => {
        set({ isLoading: true, error: null });
        try {
            await invoke("set_song", { name, songString });

            set((state) => ({
                songNames: [...state.songNames, name],
                songCache: { ...state.songCache, [name]: songString },
                isLoading: false,
            }));
        } catch (err) {
            console.error("Add song error:", err);
            set({ error: String(err), isLoading: false });
        }
    },
}));

export const useSongNames = () =>
    useSavedSongStore(useShallow((state) => state.songNames));

export const useSongDetail = (name: string) =>
    useSavedSongStore((state) => state.songCache[name]);

export const useSongActions = () =>
    useSavedSongStore(
        useShallow((state) => ({
            fetchSongNames: state.fetchSongNames,
            fetchSongDetails: state.fetchSongDetails,
            addSong: state.addSong,
        })),
    );
