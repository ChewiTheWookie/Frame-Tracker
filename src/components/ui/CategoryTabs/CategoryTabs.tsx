import { useLocation } from "react-router-dom";
import { ROUTE_METADATA } from "@/routes/metadata";
import { useActiveStore } from "@/hooks/useActiveStore";
import { useKeybind } from "@/hooks/useKeybinds";

import styles from "./CategoryTabs.module.css";

export function CategoryTabs() {
    const { pathname } = useLocation();
    const useStore = useActiveStore();

    const activeCategory = useStore((s) => s.activeCategory);
    const setCategory = useStore((s) => s.setCategory);

    const categories = ROUTE_METADATA[pathname]?.categories || [];

    const handleTab = () => {
        if (categories.length === 0) return;

        const currentIndex = categories.indexOf(activeCategory);
        const nextIndex = (currentIndex + 1) % categories.length;

        setCategory(categories[nextIndex]);
    };

    useKeybind("Tab", handleTab, { ctrl: true });

    return (
        <nav className={styles.tabsContainer}>
            {categories.map((cat) => (
                <button
                    key={cat}
                    className={`${styles.button} ${activeCategory === cat && styles.active}`}
                    onClick={() => setCategory(cat)}
                >
                    {cat}
                </button>
            ))}
        </nav>
    );
}
