import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useInventoryStore } from "../../store/useInventoryStore";
import { useWeeklyStore } from "../../store/useWeeklyStore";
import { ROUTE_REGISTRY } from "../../routes/metadata";
import { getFilters } from "../../types/filters";

import styles from "./SearchBar.module.css";

export const SearchBar = () => {
    const location = useLocation();
    const inventoryStore = useInventoryStore();
    const weeklyStore = useWeeklyStore();
    const meta = ROUTE_REGISTRY[location.pathname];

    const isWeekly = meta?.storeType === "weekly";

    const activeStore = isWeekly
        ? weeklyStore
        : meta?.storeType === "inventory"
          ? inventoryStore
          : null;

    const currentRouteKey = isWeekly ? "weekly" : "mastery";

    const [localSearch, setLocalSearch] = useState(activeStore?.search || "");
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeStore) {
            setLocalSearch(activeStore.search);
        }
    }, [activeStore?.search, location.pathname]);

    if (!activeStore) return null;

    const tabs = getFilters(activeStore, currentRouteKey);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalSearch(val);
        activeStore.setSearch(val);
    };

    return (
        <div className={styles.searchContainer}>
            <div className={styles.inputWrapper}>
                <input
                    ref={inputRef}
                    className={styles.searchInput}
                    type="text"
                    placeholder={`SEARCH ${activeStore.activeCategory.toUpperCase()}...`}
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
