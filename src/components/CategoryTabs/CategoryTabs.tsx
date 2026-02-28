import styles from "./CategoryTabs.module.css";

interface CategoryTabsProps {
    categories: readonly string[] | string[];
    activeCategory: string;
    onCategoryChange: (category: any) => void;
}

export const CategoryTabs = ({
    categories,
    activeCategory,
    onCategoryChange,
}: CategoryTabsProps) => {
    return (
        <nav className={styles.tabsContainer}>
            {categories.map((cat) => (
                <button
                    key={cat}
                    className={`${styles.tabButton} ${
                        activeCategory === cat ? styles.activeTab : ""
                    }`}
                    onClick={() => onCategoryChange(cat)}
                >
                    {cat}
                </button>
            ))}
        </nav>
    );
};
