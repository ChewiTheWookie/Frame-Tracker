import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { WeeklyTask, WeeklyCategories } from "../types/weekly";

interface WeeklyState {
    tasks: WeeklyTask[];
    isLoading: boolean;
    activeCategory: WeeklyCategories;
    setActiveCategory: (cat: WeeklyCategories) => void;
    fetchTasks: () => Promise<void>;
    adjustTask: (id: string, isIncrement: boolean) => Promise<void>;
}

export const useWeeklyStore = create<WeeklyState>((set, get) => ({
    tasks: [],
    isLoading: false,
    activeCategory: "All",
    setActiveCategory: (activeCategory) => set({ activeCategory }),

    fetchTasks: async () => {
        set({ isLoading: true });
        try {
            const rawTasks = await invoke<any[]>("get_weekly_tasks");
            console.log("DATA FROM RUST:", rawTasks[0]);

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
