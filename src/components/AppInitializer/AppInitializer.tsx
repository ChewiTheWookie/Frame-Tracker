import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useMasteryStore } from "../../stores/useMasteryStore";
import { useTaskStore } from "../../stores/useTaskStore";
import { useTimeStore } from "../../stores/useTimeStore";

export const AppInitializer = () => {
    const updateTime = useTimeStore((state) => state.updateTime);

    useEffect(() => {
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, [updateTime]);

    useEffect(() => {
        let unlistenSync: (() => void) | null = null;
        let unlistenReset: (() => void) | null = null;
        let isMounted = true;

        const setupListeners = async () => {
            const syncSub = await listen("db-initial-sync-complete", () => {
                const state = useMasteryStore.getState();
                state.fetchItems(state.itemIds.length > 0);
            });

            const resetSub = await listen("tasks-reset", () => {
                useTaskStore.getState().fetchTasks(true);
            });

            if (isMounted) {
                unlistenSync = syncSub;
                unlistenReset = resetSub;
            } else {
                syncSub();
                resetSub();
            }
        };

        setupListeners();

        return () => {
            isMounted = false;
            if (unlistenSync) unlistenSync();
            if (unlistenReset) unlistenReset();
        };
    }, []);

    return null;
};
