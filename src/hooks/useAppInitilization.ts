import { useEffect, useRef } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { check } from "@tauri-apps/plugin-updater";
import { ask } from "@tauri-apps/plugin-dialog";
import { exit } from "@tauri-apps/plugin-process";
import { error } from "@tauri-apps/plugin-log";
import { useMasteryStore } from "@/stores/useMasteryStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useTimeStore } from "@/stores/useTimeStore";
import { useKeybindStore } from "@/stores/useKeybindStore";
import { useSavedSongStore } from "@/stores/useSavedSongStore";
import { logFailure } from "@/utils/logger";

interface TaskResetPayload {
    task_names: string[];
}

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
                        await exit(0);
                    }
                }
            } catch (err) {
                error(`Failed to check for updates: ${err}`);
            }
        };

        handleUpdate();
    }, []);

    useEffect(() => {
        initializeKeybinds().catch(logFailure("Keybind Initialization"));
    }, [initializeKeybinds]);

    useEffect(() => {
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, [updateTime]);

    useEffect(() => {
        const globalCallbacks = {};
        refreshGlobals(globalCallbacks).catch(
            logFailure("Refresh Global Keybinds"),
        );
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
                    handler: (event: { payload: TaskResetPayload }) => {
                        const store = useTaskStore.getState();
                        store.actions.fetchData();
                        store.actions.setResetModal(
                            true,
                            event.payload.task_names,
                        );
                    },
                },
                {
                    name: "profile-switched",
                    handler: async () => {
                        const resetState = {
                            page: 0,
                            items: {},
                            itemIds: [],
                            hasMore: true,
                            isLoading: false,
                        };

                        useMasteryStore.setState(resetState);
                        useTaskStore.setState(resetState);
                        useSavedSongStore.setState({
                            ...resetState,
                            songCache: {},
                        } as any);

                        try {
                            await Promise.all([
                                initializeKeybinds(),
                                useMasteryStore
                                    .getState()
                                    .actions.fetchData(true),
                                useTaskStore.getState().actions.fetchData(true),
                                useSavedSongStore
                                    .getState()
                                    .actions.fetchData(true),
                            ]);
                        } catch (err) {
                            error(`Profile switch refresh failed: ${err}`);
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
