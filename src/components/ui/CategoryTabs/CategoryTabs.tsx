import { useLocation } from "react-router-dom";
import { ROUTE_METADATA } from "@/routes/metadata";
import { useActiveStore } from "@/hooks/useActiveStore";
import { useActionKeybind } from "@/hooks/useKeybinds";

import styles from "./CategoryTabs.module.css";

export function CategoryTabs() {
    const { pathname } = useLocation();
    const useStore = useActiveStore();

    const activeCategory = useStore((s) => s.activeCategory);
    const setCategory = useStore((s) => s.actions.setCategory);

    const categories = ROUTE_METADATA[pathname]?.categories || [];

    const handleTabCycle = () => {
        if (categories.length === 0) return;
        const currentIndex = categories.indexOf(activeCategory);
        const nextIndex = (currentIndex + 1) % categories.length;
        setCategory(categories[nextIndex]);
    };

    const handleTabBackCycle = () => {
        if (categories.length <= 1) return;
        const currentIndex = categories.indexOf(activeCategory);
        const prevIndex =
            (currentIndex - 1 + categories.length) % categories.length;
        setCategory(categories[prevIndex]);
    };

    useActionKeybind("CYCLE_CATEGORY_TAB", handleTabCycle);
    useActionKeybind("BACK_CYCLE_CATEGORY_TAB", handleTabBackCycle);

    return (
        <nav className={styles.tabsContainer}>
            {categories.map((cat) => (
                <button
                    key={cat}
                    className={`${styles.button} ${activeCategory === cat ? styles.active : ""}`}
                    onClick={() => setCategory(cat)}
                >
                    {cat}
                </button>
            ))}
        </nav>
    );
}
