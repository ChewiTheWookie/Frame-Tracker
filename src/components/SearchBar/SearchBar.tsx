import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useInventoryStore } from "../../store/useInventoryStore";
import { useWeeklyStore } from "../../store/useWeeklyStore";
import { ROUTES } from "../../routes/Routes";
import { getFilters } from "../../types/filters";

import styles from "./SearchBar.module.css";

export const SearchBar = () => {
    const location = useLocation();
    const inventoryStore = useInventoryStore();
    const weeklyStore = useWeeklyStore();

    const currentRouteKey = ROUTES.find(
        (r) => r.path === location.pathname,
    )?.key;

    const isWeekly = currentRouteKey === "weekly";
    const activeStore = isWeekly ? weeklyStore : inventoryStore;

    const [localSearch, setLocalSearch] = useState(activeStore.search);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setLocalSearch(activeStore.search);
    }, [activeStore.search, location.pathname]);

    const tabs = getFilters(activeStore, currentRouteKey);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalSearch(val);
        activeStore.setSearch(val);
    };

    const activeCategoryDisplay = isWeekly
        ? weeklyStore.activeCategory
        : inventoryStore.activeCategory;

    return (
        <div className={styles.searchContainer}>
            <div className={styles.inputWrapper}>
                <input
                    ref={inputRef}
                    className={styles.searchInput}
                    type="text"
                    placeholder={`SEARCH ${activeCategoryDisplay.toUpperCase()}...`}
                    value={localSearch}
                    onChange={handleTextChange}
                />
                <button
                    className={`${styles.filterToggleButton} ${isOpen ? styles.active : ""}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className={styles.icon}>⛯</span>
                </button>
            </div>

            {isOpen && (
                <div className={styles.filterDropdown}>
                    <div className={styles.dropdownHeader}>
                        ADVANCED FILTERS
                    </div>
                    {tabs.map((tab) => (
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
