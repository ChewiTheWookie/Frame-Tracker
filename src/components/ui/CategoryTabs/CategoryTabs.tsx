import { useLocation } from "react-router-dom";
import { ROUTE_METADATA } from "@/routes/metadata";
import { useActiveStore } from "@/hooks/useActiveStore";

import styles from "./CategoryTabs.module.css";

export function CategoryTabs() {
    const { pathname } = useLocation();
    const useStore = useActiveStore();

    const activeCategory = useStore((s) => s.activeCategory);
    const setCategory = useStore((s) => s.setCategory);

    const categories = ROUTE_METADATA[pathname]?.categories || [];

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
