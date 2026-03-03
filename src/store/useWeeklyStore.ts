import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { WeeklyTask } from "../types/weekly";

interface WeeklyState {
    tasks: WeeklyTask[];
    isLoading: boolean;
    activeCategory: string;
    setActiveCategory: (cat: string) => void;
    fetchTasks: () => Promise<void>;
    adjustTask: (id: string, isIncrement: boolean) => Promise<void>;
}

export const useWeeklyStore = create<WeeklyState>((set, _get) => ({
    tasks: [],
    isLoading: false,
    activeCategory: "All",
    setActiveCategory: (activeCategory) => set({ activeCategory }),

    fetchTasks: async () => {
        set({ isLoading: true });
        try {
            const tasks = await invoke<WeeklyTask[]>("get_weekly_tasks");
            set({ tasks, isLoading: false });
        } catch (error) {
            console.error("Failed to fetch weekly tasks:", error);
            set({ isLoading: false });
        }
    },

    adjustTask: async (id: string, isIncrement: boolean) => {
        try {
            await invoke("adjust_weekly_task", { id, isIncrement });

            const updatedTasks = await invoke<WeeklyTask[]>("get_weekly_tasks");
            set({ tasks: updatedTasks });
        } catch (error) {
            console.error("Failed to adjust weekly task:", error);
        }
    },
}));
