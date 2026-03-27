import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useMasteryStore } from "../../stores/useMasteryStore";
import { useTaskStore } from "../../stores/useTaskStore";

export const AppInitializer = () => {
    useEffect(() => {
        let unlistenSync: (() => void) | null = null;
        let unlistenReset: (() => void) | null = null;

        const setupListeners = async () => {
            unlistenSync = await listen("db-initial-sync-complete", () => {
                const state = useMasteryStore.getState();
                state.fetchItems(state.itemIds.length > 0);
            });

            unlistenReset = await listen("tasks-reset", () => {
                useTaskStore.getState().fetchTasks(true);
            });
        };

        setupListeners();

        return () => {
            if (unlistenSync) unlistenSync();
            if (unlistenReset) unlistenReset();
        };
    }, []);

    return null;
};
