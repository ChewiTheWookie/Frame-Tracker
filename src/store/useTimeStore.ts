import { create } from "zustand";

interface TimeState {
    now: number;
    updateTime: () => void;
}

export const useTimeStore = create<TimeState>((set) => ({
    now: Math.floor(Date.now() / 1000),
    updateTime: () => set({ now: Math.floor(Date.now() / 1000) }),
}));
