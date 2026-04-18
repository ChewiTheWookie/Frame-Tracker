import { useEffect, useRef } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { check } from "@tauri-apps/plugin-updater";
import { ask } from "@tauri-apps/plugin-dialog";
import { exit } from "@tauri-apps/plugin-process";
import { useMasteryStore } from "@/stores/useMasteryStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useTimeStore } from "@/stores/useTimeStore";
import { useKeybindStore } from "@/stores/useKeybindStore";
import { useSavedSongStore } from "@/stores/useSavedSongStore";

export const useAppInitialization = () => {
    const updateTime = useTimeStore((state) => state.updateTime);

    const registry = useKeybindStore((s) => s.registry);
    const initializeKeybinds = useKeybindStore((s) => s.initialize);
    const refreshGlobals = useKeybindStore((s) => s.refreshGlobalShortcuts);

    const unlisteners = useRef<UnlistenFn[]>([]);

    useEffect(() => {
        const handleUpdate = async () => {
            if (import.meta.env.DEV) return;

            try {
                const update = await check();
                if (update?.available) {
                    const confirmed = await ask(
                        `Version ${update.version} is available. Install and restart?`,
                        { title: "Update Available", kind: "info" },
                    );

                    if (confirmed) {
                        await update.downloadAndInstall();
                        await exit(0)
                    }
                }
            } catch (error) {
                console.error("Failed to check for updates:", error);
            }
        };

        handleUpdate();
    }, []);

    useEffect(() => {
        initializeKeybinds().catch(console.error);
    }, [initializeKeybinds]);

    useEffect(() => {
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, [updateTime]);

    useEffect(() => {
        const globalCallbacks = {};
        refreshGlobals(globalCallbacks).catch(console.error);
    }, [registry, refreshGlobals]);

    useEffect(() => {
        let isMounted = true;

        const setupListeners = async () => {
            const eventSubs = [
                {
                    name: "db-initial-sync-complete",
                    handler: () => {
                        const state = useMasteryStore.getState();
                        if ("fetchItems" in state)
                            (state as any).fetchItems(state.itemIds.length > 0);
                    },
                },
                {
                    name: "tasks-reset",
                    handler: () => {
                        const state = useTaskStore.getState();
                        if ("fetchTasks" in state)
                            (state as any).fetchTasks(true);
                    },
                },
                {
                    name: "profile-switched",
                    handler: async () => {
                        useMasteryStore.setState({
                            page: 0,
                            items: {},
                            itemIds: [],
                        });
                        useTaskStore.setState({
                            page: 0,
                            tasks: {},
                            taskIds: [],
                        });
                        useSavedSongStore.setState({
                            songNames: [],
                            songCache: {},
                            isLoading: false,
                        });

                        const masteryActions =
                            useMasteryStore.getState().actions;
                        const taskActions = (useTaskStore.getState() as any)
                            .actions;
                        const songActions =
                            useSavedSongStore.getState().actions;

                        try {
                            await Promise.all([
                                initializeKeybinds(),
                                masteryActions.fetchItems(true),
                                taskActions?.fetchTasks?.(true),
                                songActions.fetchSongNames(true),
                            ]);
                        } catch (err) {
                            console.error(
                                "Failed to refresh data after profile switch:",
                                err,
                            );
                        }
                    },
                },
            ];

            const settledUnlisteners: UnlistenFn[] = [];
            for (const sub of eventSubs) {
                const unlisten = await listen(sub.name, sub.handler);
                settledUnlisteners.push(unlisten);
            }

            if (isMounted) {
                unlisteners.current.push(...settledUnlisteners);
            } else {
                settledUnlisteners.forEach((fn) => fn());
            }
        };

        setupListeners();

        return () => {
            isMounted = false;
            unlisteners.current.forEach((unlisten) => unlisten());
            unlisteners.current = [];
        };
    }, [initializeKeybinds]);
};
