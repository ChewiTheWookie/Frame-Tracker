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
    getSummaries: (): Promise<LicenseSummary[]> =>
        invoke<LicenseSummary[]>("get_license_names"),

    getDetailed: (id: string): Promise<LicenseDetails> =>
        invoke<LicenseDetails>("get_license_details", { id }),
};
