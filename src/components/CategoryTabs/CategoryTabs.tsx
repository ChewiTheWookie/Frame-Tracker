import { useLocation } from "react-router-dom";
import { useInventoryStore } from "../../store/useInventoryStore";
import { useWeeklyStore } from "../../store/useWeeklyStore";
import { MASTERY_CATEGORIES } from "../../types/inventory";
import { WEEKLY_CATEGORIES } from "../../types/weekly";

import styles from "./CategoryTabs.module.css";

export function CategoryTabs() {
    const { pathname } = useLocation();

    const activeMasteryCat = useInventoryStore((state) => state.activeCategory);
    const setActiveMasteryCat = useInventoryStore(
        (state) => state.setActiveCategory,
    );

    const activeWeeklyCat = useWeeklyStore((state) => state.activeCategory);
    const setActiveWeeklyCat = useWeeklyStore(
        (state) => state.setActiveCategory,
    );

    let categories: readonly string[] = [];
    let activeCategory = "";
    let updateStore: (category: any) => void;

    switch (pathname) {
        case "/":
            categories = MASTERY_CATEGORIES;
            activeCategory = activeMasteryCat;
            updateStore = setActiveMasteryCat;
            break;
        case "/weekly":
            categories = WEEKLY_CATEGORIES;
            activeCategory = activeWeeklyCat;
            updateStore = setActiveWeeklyCat;
            break;
        default:
            return null;
    }

    const handleCategoryClick = (cat: string) => {
        updateStore(cat);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    if (categories.length === 0) return null;

    return (
        <nav className={styles.tabsContainer}>
            {categories.map((cat) => (
                <button
                    key={cat}
                    className={`${styles.tabButton} ${
                        activeCategory === cat ? styles.activeTab : ""
                    }`}
                    onClick={() => handleCategoryClick(cat)}
                >
                    {cat}
                </button>
            ))}
        </nav>
    );
}
