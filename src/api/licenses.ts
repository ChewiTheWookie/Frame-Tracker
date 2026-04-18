import { invoke } from "@tauri-apps/api/core";

export interface LicenseSummary {
    readonly id: string;
    readonly name: string;
    readonly version: string | null;
    readonly source: "npm" | "cargo";
}

export interface LicenseDetails {
    readonly id: string;
    readonly license_text: string | null;
    readonly repository: string | null;
    readonly author: string | null;
}

export const licenseService = {
    getSummaries: (search: string, limit: number, offset: number) =>
        invoke<LicenseSummary[]>("get_license_names", {
            search,
            limit,
            offset,
        }),

    getDetailed: (id: string) =>
        invoke<LicenseDetails>("get_license_details", { id }),
};
