import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { FilterState, getFilterDefinitions } from "../../types/filters";

import styles from "./Searchbar.module.css";

interface Props<T extends string> {
    search?: string;
    setSearch: (search: string) => void;
    activeCategory?: T;

    filters: FilterState;
    setFilters: (filters: any) => void;
}

export function Searchbar<T extends string>({
    search = "",
    setSearch,
    activeCategory,
    filters,
    setFilters,
}: Props<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const filterDefs = getFilterDefinitions(filters, setFilters);

    const [localValue, setLocalValue] = useState(search);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalValue(search);
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(localValue);
        }, 150);

        return () => clearTimeout(timer);
    }, [localValue, setSearch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    };

    return (
        <div className={styles.searchContainer}>
            <input
                className={styles.input}
                ref={inputRef}
                type="text"
                placeholder={`Search ${activeCategory || "All"}...`}
                value={localValue}
                onChange={handleChange}
            />
            <button
                className={`${styles.filterButton} ${isOpen ? styles.active : ""}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <SlidersHorizontal
                    size={18}
                    strokeWidth={2}
                    className={styles.filterIcon}
                />
            </button>

            {isOpen && (
                <div className={styles.filterDropdown}>
                    <div className={styles.dropdownHeader}>
                        ADVANCED FILTERS
                    </div>
                    {filterDefs.map((filter) => (
                        <div className={styles.filterOption} key={filter.id}>
                            <span>{filter.label}</span>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={filter.checked}
                                    onChange={(e) =>
                                        filter.onChange(e.target.checked)
                                    }
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
