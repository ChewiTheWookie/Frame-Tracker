import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import {
    licenseService,
    type LicenseSummary,
    type LicenseDetails,
} from "@/api/licenses";

interface LicenseState {
    summaries: LicenseSummary[];
    detailsCache: Record<string, LicenseDetails>;
    isLoading: boolean;
    error: string | null;

    actions: {
        fetchSummaries: () => Promise<void>;
        fetchDetailed: (id: string) => Promise<void>;
    };
}

export const useLicenseStore = create<LicenseState>((set, get) => ({
    summaries: [],
    detailsCache: {},
    isLoading: false,
    error: null,

    actions: {
        fetchSummaries: async () => {
            const { summaries, isLoading } = get();
            if (summaries.length > 0 || isLoading) return;

            set({ isLoading: true, error: null });
            try {
                const data = await licenseService.getSummaries();
                set({ summaries: data, isLoading: false });
            } catch (err) {
                console.error("Fetch summaries error:", err);
                set({ error: String(err), isLoading: false });
            }
        },

        fetchDetailed: async (id: string) => {
            if (get().detailsCache[id]) return;

            try {
                const detailed = await licenseService.getDetailed(id);
                set((state) => ({
                    detailsCache: { ...state.detailsCache, [id]: detailed },
                }));
            } catch (err) {
                console.error(`[License] Detail fetch failed for ${id}:`, err);
            }
        },
    },
}));

export const useLicenseActions = () => useLicenseStore((s) => s.actions);

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
