import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { WorldState } from "../types/worldState";

interface DailyState {
    worldState: WorldState | null;
    isLoading: boolean;
    refreshState: () => Promise<void>;
}

export const useDailyStore = create<DailyState>((set) => ({
    worldState: null,
    isLoading: false,
    refreshState: async () => {
        set({ isLoading: true });
        try {
            // MUST HAVE await HERE
            const data = await invoke<WorldState>("fetch_world_data");
            console.log("Data from Rust:", data); // Check if this prints in browser console
            set({ worldState: data, isLoading: false });
        } catch (error) {
            console.error("Rust Error:", error);
            set({ isLoading: false });
        }
    },
}));
