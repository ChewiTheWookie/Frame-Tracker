export const LICENSE_BLACKLIST = [
    "typescript",
    "vite",
    "prettier",
    "tsx",
    "@types/",
    "@tauri-apps/cli",

    "tauri-build",
    "proc-macro2",
    "quote",
    "syn",
    "unicode-ident",
    "serde_derive",
    "sqlx-macros",
];

export function isBlacklisted(id: string): boolean {
    return LICENSE_BLACKLIST.some((term) =>
        id.toLowerCase().includes(term.toLowerCase()),
    );
}
