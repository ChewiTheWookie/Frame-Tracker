import { createDataStore } from "@/stores/createDataStore";
import { useShallow } from "zustand/react/shallow";
import { StoreApi, UseBoundStore } from "zustand";
import { BaseState } from "@/types/store";
import {
    licenseService,
    type LicenseSummary,
    type LicenseDetails,
} from "@/api/licenses";
import { error } from "@tauri-apps/plugin-log";

type LicenseCategory = string;
interface LicenseFilters {}
interface LicenseStats {}

interface ExtendedActions {
    fetchDetailed: (id: string) => Promise<void>;
}

interface ExtraState {
    detailsCache: Record<string, LicenseDetails>;
}

type FullLicenseState = BaseState<
    LicenseSummary,
    LicenseFilters,
    LicenseStats,
    LicenseCategory
> & {
    actions: ReturnType<typeof licenseBundle.useActions> & ExtendedActions;
} & ExtraState;

const licenseBundle = createDataStore<
    LicenseSummary,
    LicenseFilters,
    LicenseStats,
    LicenseCategory
>({
    initialStats: {},
    initialFilters: {},
    fetchItems: async ({ query, limit, offset }) => {
        const items = await licenseService.getSummaries(query, limit, offset);
        return [items, {}];
    },
});

export const useLicenseStore = licenseBundle.useStore as UseBoundStore<
    StoreApi<FullLicenseState>
>;

useLicenseStore.setState((state) => ({
    detailsCache: {},
    actions: {
        ...state.actions,
        fetchDetailed: async (id: string) => {
            const current = useLicenseStore.getState();
            if (current.detailsCache[id]) return;

            try {
                const detailed = await licenseService.getDetailed(id);
                useLicenseStore.setState((s) => ({
                    detailsCache: {
                        ...s.detailsCache,
                        [id]: detailed,
                    },
                }));
            } catch (err) {
                error(`[License] Detail fetch failed for ${id}: ${err}`);
            }
        },
    },
}));

export const useLicenseActions = () => useLicenseStore((s) => s.actions);

export const useLicenseItemIds = licenseBundle.useItemIds;
export const useLicenseItemById = licenseBundle.useItemById;

export const useLicenseDetail = (id: string) =>
    useLicenseStore((state) => state.detailsCache[id]);

export const useFrontendLicenses = () =>
    useLicenseStore(
        useShallow((state) =>
            state.itemIds
                .map((id) => state.items[id])
                .filter((s) => s?.source === "npm"),
        ),
    );

export const useBackendLicenses = () =>
    useLicenseStore(
        useShallow((state) =>
            state.itemIds
                .map((id) => state.items[id])
                .filter((s) => s?.source === "cargo"),
        ),
    );
