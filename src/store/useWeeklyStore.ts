import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { WeeklyTask, WeeklyCategories, TAG_FILTER_MAP } from "../types/weekly";

interface WeeklyState {
    tasks: WeeklyTask[];
    isLoading: boolean;
    activeCategory: WeeklyCategories;
    setActiveCategory: (cat: WeeklyCategories) => void;
    fetchTasks: () => Promise<void>;
    adjustTask: (id: string, isIncrement: boolean) => Promise<void>;
    search: string;
    showAllBacks: boolean;
    filters: {
        hideCompleted: boolean;
        hideIncompleted: boolean;
    } & Record<keyof typeof TAG_FILTER_MAP, boolean>;
    setSearch: (val: string) => void;
    toggleShowAllBacks: () => void;
    toggleFilter: (key: string) => void;
}

export const useWeeklyStore = create<WeeklyState>((set, get) => ({
    tasks: [],
    isLoading: false,
    activeCategory: "All",
    search: "",
    showAllBacks: false,
    filters: {
        hideCompleted: false,
        hideIncompleted: false,
        hideMission: false,
        hideTrade: false,
        hideCraft: false,
        hideSyndicate: false,
        hideSearchPulse: false,
        hideMisc: false,
        hideTask: false,
    },

    setActiveCategory: (activeCategory) => set({ activeCategory }),
    setSearch: (search) => {
        set({ search });
        get().fetchTasks();
    },
    toggleShowAllBacks: () =>
        set((state) => ({ showAllBacks: !state.showAllBacks })),
    toggleFilter: (key) => {
        set((state) => ({
            filters: {
                ...state.filters,
                [key]: !state.filters[key as keyof typeof state.filters],
            },
        }));
        get().fetchTasks();
    },

    fetchTasks: async () => {
        set({ isLoading: true });
        try {
            const rawTasks = await invoke<any[]>("get_weekly_tasks");

            const processedTasks = rawTasks.map((task) => ({
                ...task,
                tags:
                    typeof task.tags === "string"
                        ? JSON.parse(task.tags)
                        : task.tags || [],
            }));

            set({ tasks: processedTasks, isLoading: false });
        } catch (error) {
            console.error("Failed to fetch weekly tasks:", error);
            set({ isLoading: false });
        }
    },

    adjustTask: async (id: string, isIncrement: boolean) => {
        try {
            await invoke("adjust_weekly_task", {
                id,
                isIncrement: isIncrement,
            });

            const { fetchTasks } = get();
            await fetchTasks();
        } catch (error) {
            console.error("Failed to adjust weekly task:", error);
        }
    },
}));
