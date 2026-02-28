import { useState } from "react";
import { useInventoryStore } from "../../store/useInventoryStore";
import styles from "./SearchBar.module.css";

export const SearchBar = () => {
    const { search, setSearch, activeCategory, filters, toggleFilter } =
        useInventoryStore();
    const { showAllBacks, toggleShowAllBacks } = useInventoryStore();
    const [isOpen, setIsOpen] = useState(false);

    const tabs = [
        {
            key: "showAllBacks",
            name: "SHOW ALL BACKS",
            checked: showAllBacks,
            onChange: toggleShowAllBacks,
        },
        {
            key: "nonPrimesOnly",
            name: "HIDE PRIMES",
            checked: filters.nonPrimesOnly,
            onChange: () => toggleFilter("nonPrimesOnly"),
        },
        {
            key: "primesOnly",
            name: "HIDE NON PRIMES",
            checked: filters.primesOnly,
            onChange: () => toggleFilter("primesOnly"),
        },
        {
            key: "hideUnowned",
            name: "HIDE UNOWNED",
            checked: filters.hideUnowned,
            onChange: () => toggleFilter("hideUnowned"),
        },
        {
            key: "craftableOnly",
            name: "HIDE CRAFTABLE",
            checked: filters.craftableOnly,
            onChange: () => toggleFilter("craftableOnly"),
        },
        {
            key: "ownedOnly",
            name: "HIDE OWNED",
            checked: filters.ownedOnly,
            onChange: () => toggleFilter("ownedOnly"),
        },
        {
            key: "hideOwned",
            name: "HIDE MASTERED",
            checked: filters.hideOwned,
            onChange: () => toggleFilter("hideOwned"),
        },
        {
            key: "hideFed",
            name: "HIDE HELMINTHED",
            checked: filters.hideFed,
            onChange: () => toggleFilter("hideFed"),
        },
    ];

    return (
        <div className={styles.searchContainer}>
            <div className={styles.inputWrapper}>
                <input
                    className={styles.searchInput}
                    type="text"
                    placeholder={`SEARCH ${activeCategory.toUpperCase()}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
