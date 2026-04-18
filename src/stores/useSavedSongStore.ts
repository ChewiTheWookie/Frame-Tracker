import { songService } from "@/api/songs";
import { createDataStore } from "@/stores/createDataStore";
import { useShallow } from "zustand/react/shallow";
import { BaseState } from "@/types/store";
import { error } from "@tauri-apps/plugin-log";

export interface SongItem {
    id: string;
    name: string;
}

type SongFilters = {};
type SongStats = { total: number };
type SongCategory = "All";

interface ExtraSongState {
    songCache: Record<string, string>;
}

const songDataStore = createDataStore<
    SongItem,
    SongFilters,
    SongStats,
    SongCategory
>({
    initialFilters: {},
    initialStats: { total: 0 },
    fetchItems: async ({ query, limit, offset }) => {
        const names = await songService.getSongNames({
            query,
            limit,
            offset,
        });

        const items = names.map((name) => ({ id: name, name }));
        return [items, { total: names.length }];
    },
});

export const useSavedSongStore =
    songDataStore.useStore as unknown as import("zustand").UseBoundStore<
        import("zustand").StoreApi<
            BaseState<SongItem, SongFilters, SongStats, SongCategory> & {
                actions: any;
            } & ExtraSongState
        >
    >;

useSavedSongStore.setState((state) => ({
    ...state,
    songCache: state.songCache || {},
}));

export const useSongNames = () =>
    useSavedSongStore(useShallow((s) => s.itemIds));

export const useSongStats = () => useSavedSongStore(useShallow((s) => s.stats));

export const useSongActions = () => {
    const baseActions = useSavedSongStore((s) => s.actions);
    const songCache = useSavedSongStore((s) => s.songCache);

    return {
        ...baseActions,

        fetchSongDetails: async (name: string) => {
            if (songCache[name]) return;
            try {
                const songString = await songService.getSongDetails(name);
                if (songString) {
                    useSavedSongStore.setState((state) => ({
                        songCache: { ...state.songCache, [name]: songString },
                    }));
                }
            } catch (err) {
                error(`[Songs] Detail fetch failed for ${name}: ${err}`);
            }
        },

        addSong: async (name: string, songString: string) => {
            try {
                await songService.setSong(name, songString);
                await baseActions.fetchData(true);
                useSavedSongStore.setState((state) => ({
                    songCache: { ...state.songCache, [name]: songString },
                }));
            } catch (err) {
                error(`Add song error: ${err}`);
            }
        },

        renameSong: async (oldName: string, newName: string) => {
            try {
                await songService.renameSong(oldName, newName);
                await baseActions.fetchData(true);
                useSavedSongStore.setState((state) => {
                    const newCache = { ...state.songCache };
                    if (newCache[oldName]) {
                        newCache[newName] = newCache[oldName];
                        delete newCache[oldName];
                    }
                    return { songCache: newCache };
                });
            } catch (err) {
                error(`Rename error: ${err}`);
            }
        },

        deleteSong: async (name: string) => {
            try {
                await songService.deleteSong(name);
                await baseActions.fetchData(true);
                useSavedSongStore.setState((state) => {
                    const { [name]: _, ...remainingCache } = state.songCache;
                    return { songCache: remainingCache };
                });
            } catch (err) {
                error(`Delete error: ${err}`);
            }
        },
    };
};

export const useSongDetail = (name: string) =>
    useSavedSongStore((state) => state.songCache[name]);
