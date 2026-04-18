import { create } from "zustand";
import { profileService } from "@/api/profiles";

interface ProfileState {
    profiles: string[];
    currentProfile: string;
    isLoading: boolean;
    error: string | null;

    actions: {
        refresh: () => Promise<void>;

        switchProfile: (name: string) => Promise<void>;
        createProfile: (name: string) => Promise<void>;
        renameProfile: (oldName: string, newName: string) => Promise<void>;
        deleteProfile: (name: string) => Promise<void>;

        initializeListener: () => Promise<() => void>;
    };
}

export const useProfileStore = create<ProfileState>((set, get) => ({
    profiles: [],
    currentProfile: "Default",
    isLoading: false,
    error: null,

    actions: {
        refresh: async () => {
            set({ isLoading: true, error: null });
            try {
                const [list, active] = await Promise.all([
                    profileService.list(),
                    profileService.getCurrent(),
                ]);
                set({
                    profiles: list,
                    currentProfile: active,
                    isLoading: false,
                });
            } catch (err) {
                console.error("[ProfileStore] Refresh failed:", err);
                set({ error: String(err), isLoading: false });
            }
        },

        switchProfile: async (name: string) => {
            try {
                await profileService.switch(name);
                set({ currentProfile: name });
            } catch (err) {
                console.error("[ProfileStore] Switch failed:", err);
                throw err;
            }
        },

        createProfile: async (name: string) => {
            set({ isLoading: true });
            try {
                await profileService.create(name);
                await get().actions.refresh();
            } catch (err) {
                set({ error: String(err), isLoading: false });
                throw err;
            }
        },

        renameProfile: async (oldName: string, newName: string) => {
            try {
                await profileService.rename(oldName, newName);
                await get().actions.refresh();
            } catch (err) {
                console.error("[ProfileStore] Rename failed:", err);
                throw err;
            }
        },

        deleteProfile: async (name: string) => {
            try {
                await profileService.delete(name);
                await get().actions.refresh();
            } catch (err) {
                console.error("[ProfileStore] Delete failed:", err);
                throw err;
            }
        },

        initializeListener: async () => {
            const unlisten = await profileService.onSwitch((name) => {
                set({ currentProfile: name });
            });
            return unlisten;
        },
    },
}));

export const useProfiles = () => useProfileStore((s) => s.profiles);
export const useCurrentProfile = () => useProfileStore((s) => s.currentProfile);
export const useProfileActions = () => useProfileStore((s) => s.actions);
