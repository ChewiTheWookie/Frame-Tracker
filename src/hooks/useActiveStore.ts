import { useLocation } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { useMasteryStore } from "@/stores/useMasteryStore";
import { useTaskStore } from "@/stores/useTaskStore";

export function useActiveStore() {
    const { pathname } = useLocation();
    const rootPath = `/${pathname.split("/")[1]}`;

    return <T>(selector: (state: any) => T): T => {
        switch (rootPath) {
            case PATHS.Tasks:
                return useTaskStore(selector);
            case PATHS.Mastery:
            default:
                return useMasteryStore(selector);
        }
    };
}
