import { useState, useEffect, useRef } from "react";
import { useActiveStore } from "../../hooks/useActiveStore";
import { getFilters } from "../../types/filters";
import { SlidersHorizontal } from "lucide-react";

import styles from "./SearchBar.module.css";

export const SearchBar = () => {
    const { store, currentRouteKey, pathname } = useActiveStore();

    const [localSearch, setLocalSearch] = useState(store?.search || "");
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (store) {
            setLocalSearch(store.search);
        }
    }, [store?.search, pathname]);

    useEffect(() => {
        const handleFocus = () => inputRef.current?.focus();
        window.addEventListener("focus-search", handleFocus);
        return () => window.removeEventListener("focus-search", handleFocus);
    }, []);

    if (!store) return null;

    const filters = getFilters(store, currentRouteKey);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalSearch(val);
        store.setSearch(val);
    };

    return (
        <div className={styles.searchContainer}>
            <div className={styles.inputWrapper}>
                <input
                    ref={inputRef}
                    className={styles.searchInput}
                    type="text"
                    placeholder={`SEARCH ${store.activeCategory.toUpperCase()}...`}
                    value={localSearch}
                    onChange={handleTextChange}
                />
                <button
                    className={`${styles.filterToggleButton} ${isOpen ? styles.active : ""}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <SlidersHorizontal
                        size={18}
                        strokeWidth={2}
                        className={styles.icon}
                    />
                </button>
            </div>

            {isOpen && (
                <div className={styles.filterDropdown}>
                    <div className={styles.dropdownHeader}>
                        ADVANCED FILTERS
                    </div>
                    {filters.map((tab) => (
                        <div className={styles.filterOption} key={tab.key}>
                            <span>{tab.name}</span>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={tab.checked}
                                    onChange={tab.onChange}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
