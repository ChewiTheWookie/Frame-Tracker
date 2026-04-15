import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { songService } from "@/api/songs";

interface SongState {
    songNames: string[];
    songCache: Record<string, string>;
    isLoading: boolean;
    error: string | null;

    actions: {
        fetchSongNames: () => Promise<void>;
        fetchSongDetails: (name: string) => Promise<void>;
        addSong: (name: string, songString: string) => Promise<void>;
        renameSong: (oldName: string, newName: string) => Promise<void>;
        deleteSong: (name: string) => Promise<void>;
    };
}

export const useSavedSongStore = create<SongState>((set, get) => ({
    songNames: [],
    songCache: {},
    isLoading: false,
    error: null,

    actions: {
        fetchSongNames: async () => {
            const { songNames, isLoading } = get();
            if (songNames.length > 0 || isLoading) return;

            set({ isLoading: true, error: null });
            try {
                const names = await songService.getSongNames();
                set({ songNames: names, isLoading: false });
            } catch (err) {
                set({ error: String(err), isLoading: false });
            }
        },

        fetchSongDetails: async (name: string) => {
            if (get().songCache[name]) return;
            try {
                const songString = await songService.getSongDetails(name);
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
                await songService.setSong(name, songString);
                set((state) => ({
                    songNames: [...state.songNames, name],
                    songCache: { ...state.songCache, [name]: songString },
                    isLoading: false,
                }));
            } catch (err) {
                set({ error: String(err), isLoading: false });
            }
        },

        renameSong: async (oldName: string, newName: string) => {
            try {
                await songService.renameSong(oldName, newName);
                set((state) => {
                    const newNames = state.songNames.map((n) =>
                        n === oldName ? newName : n,
                    );
                    const newCache = { ...state.songCache };
                    if (newCache[oldName]) {
                        newCache[newName] = newCache[oldName];
                        delete newCache[oldName];
                    }
                    return { songNames: newNames, songCache: newCache };
                });
            } catch (err) {
                console.error("Rename error:", err);
            }
        },

        deleteSong: async (name: string) => {
            try {
                await songService.deleteSong(name);
                set((state) => {
                    const { [name]: _, ...remainingCache } = state.songCache;
                    return {
                        songNames: state.songNames.filter((n) => n !== name),
                        songCache: remainingCache,
                    };
                });
            } catch (err) {
                console.error("Delete error:", err);
            }
        },
    },
}));

export const useSongNames = () =>
    useSavedSongStore(useShallow((state) => state.songNames));
export const useSongDetail = (name: string) =>
    useSavedSongStore((state) => state.songCache[name]);
export const useSongActions = () => useSavedSongStore((state) => state.actions);
