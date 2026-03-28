import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { invoke } from "@tauri-apps/api/core";

interface LicenseSummary {
    readonly id: string;
    readonly name: string;
    readonly version: string | null;
    readonly source: "npm" | "cargo";
}

interface LicenseDetails {
    readonly id: string;
    readonly license_text: string | null;
    readonly repository: string | null;
    readonly author: string | null;
}

interface LicenseState {
    summaries: LicenseSummary[];
    detailsCache: Record<string, LicenseDetails>;
    isLoading: boolean;
    error: string | null;

    fetchSummaries: () => Promise<void>;
    fetchDetailed: (id: string) => Promise<void>;
}

export const useLicenseStore = create<LicenseState>((set, get) => ({
    summaries: [],
    detailsCache: {},
    isLoading: false,
    error: null,

    fetchSummaries: async () => {
        const { summaries, isLoading } = get();
        if (summaries.length > 0 || isLoading) return;

        set({ isLoading: true, error: null });
        try {
            const summaries = await invoke<LicenseSummary[]>(
                "get_license_summaries",
            );

            set({ summaries, isLoading: false });
        } catch (err) {
            console.error("Fetch summaries error:", err);
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
            console.error(`[License] Detail fetch failed for ${id}:`, err);
        }
    },
}));

export const useFrontendLicenses = () =>
    useLicenseStore(
        useShallow((state) =>
            state.summaries.filter((s) => s.source === "npm"),
        ),
    );

export const useBackendLicenses = () =>
    useLicenseStore(
        useShallow((state) =>
            state.summaries.filter((s) => s.source === "cargo"),
        ),
    );

export const useLicenseDetail = (id: string) =>
    useLicenseStore((state) => state.detailsCache[id]);
