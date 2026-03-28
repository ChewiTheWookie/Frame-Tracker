import { useEffect, useRef } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { useMasteryStore } from "../../stores/useMasteryStore";
import { useTaskStore } from "../../stores/useTaskStore";
import { useTimeStore } from "../../stores/useTimeStore";

export const AppInitializer = () => {
    const updateTime = useTimeStore((state) => state.updateTime);
    const unlisteners = useRef<UnlistenFn[]>([]);

    useEffect(() => {
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, [updateTime]);

    useEffect(() => {
        let isMounted = true;

        const setupListeners = async () => {
            const unlistenSync = await listen(
                "db-initial-sync-complete",
                () => {
                    const state = useMasteryStore.getState();
                    state.fetchItems(state.itemIds.length > 0);
                },
            );

            const unlistenReset = await listen("tasks-reset", () => {
                useTaskStore.getState().fetchTasks(true);
            });

            if (isMounted) {
                unlisteners.current.push(unlistenSync, unlistenReset);
            } else {
                unlistenSync();
                unlistenReset();
            }
        };

        setupListeners();

        return () => {
            isMounted = false;
            unlisteners.current.forEach((unlisten) => unlisten());
            unlisteners.current = [];
        };
    }, []);

    return null;
};
