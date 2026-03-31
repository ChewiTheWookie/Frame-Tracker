import styles from "./CategoryTabs.module.css";

interface Props<T extends string> {
    categories: readonly T[] | T[];
    activeCategory?: T;
    onCategoryChange: (category: T) => void;
}

export function CategoryTabs<T extends string>({
    categories,
    activeCategory,
    onCategoryChange,
}: Props<T>) {
    return (
        <nav className={styles.tabsContainer}>
            {categories.map((cat) => (
                <button
                    key={cat}
                    className={`${styles.button} ${activeCategory === cat && styles.active}`}
                    onClick={() => onCategoryChange(cat)}
                >
                    {cat}
                </button>
            ))}
        </nav>
    );
}
