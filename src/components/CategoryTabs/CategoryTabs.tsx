import { useActiveStore } from "../../hooks/useActiveStore";
import styles from "./CategoryTabs.module.css";

export function CategoryTabs() {
    const { store, categories, updateCategory, meta } = useActiveStore();

    if (!meta?.features?.tabs || !categories || categories.length === 0) {
        return null;
    }

    const handleCategoryClick = (cat: string) => {
        updateCategory(cat);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <nav className={styles.tabsContainer}>
            {categories.map((cat) => (
                <button
                    key={cat}
                    className={`${styles.tabButton} ${
                        (store.activeCategory as string) === cat
                            ? styles.activeTab
                            : ""
                    }`}
                    onClick={() => handleCategoryClick(cat)}
                >
                    {cat}
                </button>
            ))}
        </nav>
    );
}
