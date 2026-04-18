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
                        { title: "Update Available", kind: "info" }
                    );

                    if (confirmed) {
                        await update.downloadAndInstall();
                        await exit(0);
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
                        state.actions.fetchData(state.itemIds.length > 0);
                    },
                },
                {
                    name: "tasks-reset",
                    handler: () => {
                        useTaskStore.getState().actions.fetchData(true);
                    },
                },
                {
                    name: "profile-switched",
                    handler: async () => {
                        const resetObj = {
                            page: 0,
                            items: {},
                            itemIds: [],
                            hasMore: true,
                            isLoading: false,
                        };

                        useMasteryStore.setState(resetObj);
                        useTaskStore.setState(resetObj);
                        useSavedSongStore.setState({
                            songNames: [],
                            songCache: {},
                            isLoading: false,
                        });

                        try {
                            await Promise.all([
                                initializeKeybinds(),
                                useMasteryStore
                                    .getState()
                                    .actions.fetchData(true),
                                useTaskStore.getState().actions.fetchData(true),
                                useSavedSongStore
                                    .getState()
                                    .actions.fetchSongNames(true),
                            ]);
                        } catch (err) {
                            console.error(
                                "Profile switch refresh failed:",
                                err
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
