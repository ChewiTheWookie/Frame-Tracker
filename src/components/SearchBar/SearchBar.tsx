import { useState, useEffect, useRef } from "react";
import { useInventoryStore } from "../../store/useInventoryStore";
import { ROUTES } from "../../routes/Routes";
import { getFilters } from "../../types/filters";

import styles from "./SearchBar.module.css";

export const SearchBar = () => {
    const store = useInventoryStore();
    const setSearch = useInventoryStore((state) => state.setSearch);
    const search = useInventoryStore((state) => state.search);
    const activeCategory = useInventoryStore((state) => state.activeCategory);
    const [localSearch, setLocalSearch] = useState(search);
    const inputRef = useRef<HTMLInputElement>(null);

    const [isOpen, setIsOpen] = useState(false);

    const currentRouteKey = ROUTES.find(
        (r) => r.path === location.pathname,
    )?.key;

    const tabs = getFilters(store, currentRouteKey);

    useEffect(() => {
        const handleFocusRequest = () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            inputRef.current?.focus();
        };

        window.addEventListener("focus-search", handleFocusRequest);
        return () =>
            window.removeEventListener("focus-search", handleFocusRequest);
    }, []);

    useEffect(() => {
        setLocalSearch(search);
    }, [search]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalSearch(val);
        setSearch(val);
    };

    return (
        <div className={styles.searchContainer}>
            <div className={styles.inputWrapper}>
                <input
                    ref={inputRef}
                    className={styles.searchInput}
                    type="text"
                    placeholder={`SEARCH ${activeCategory.toUpperCase()}...`}
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
