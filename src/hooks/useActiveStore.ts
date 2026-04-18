import { useLocation } from "react-router-dom";
import { ROUTE_METADATA } from "@/routes/metadata";

export function useActiveStore() {
    const { pathname } = useLocation();

    const activeStoreHook = ROUTE_METADATA[pathname]?.store;

    return <T>(selector: (state: any) => T): T | null => {
        if (!activeStoreHook) return null;

        return activeStoreHook(selector);
    };
}
