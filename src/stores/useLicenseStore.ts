import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

interface LicenseSummary {
    id: string;
    name: string;
    version: string | null;
    source: string;
}

interface LicenseDetails {
    id: string;
    license_text: string | null;
    repository: string | null;
    author: string | null;
}

interface LicenseState {
    summaries: LicenseSummary[];
    detailsCache: Record<string, LicenseDetails>;
    isLoading: boolean;
    error: string | null;

    fetchSummaries: () => Promise<void>;
    fetchDetailed: (id: string) => Promise<void>;

    getFrontendLicenses: () => LicenseSummary[];
    getBackendLicenses: () => LicenseSummary[];
}

export const useLicenseStore = create<LicenseState>((set, get) => ({
    summaries: [],
    detailsCache: {},
    isLoading: false,
    error: null,

    fetchSummaries: async () => {
        if (get().summaries.length > 0) return;

        set({ isLoading: true, error: null });
        try {
            const summaries = await invoke<LicenseSummary[]>(
                "get_license_summaries",
            );
            set({ summaries, isLoading: false });
        } catch (err) {
            set({ error: String(err), isLoading: false });
        }
    },

    fetchDetailed: async (id: string) => {
        if (get().detailsCache[id]) return;

        try {
            const detailed = await invoke<LicenseDetails>(
                "get_license_detailed",
                { id },
            );
            set((state) => ({
                detailsCache: { ...state.detailsCache, [id]: detailed },
            }));
        } catch (err) {
            console.error(`Failed to fetch details for ${id}:`, err);
        }
    },

    getFrontendLicenses: () =>
        get().summaries.filter((s) => s.source === "npm"),
    getBackendLicenses: () =>
        get().summaries.filter((s) => s.source === "cargo"),
}));
