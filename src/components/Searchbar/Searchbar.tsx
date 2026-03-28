import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { FilterState, getFilterDefinitions } from "../../types/filters";
import { useKeybind } from "../../hooks/useKeybinds";

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
    const [localValue, setLocalValue] = useState(search);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const filterDefs = getFilterDefinitions(filters, setFilters);

    useEffect(() => {
        if (search !== localValue) {
            setLocalValue(search);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== search) {
                setSearch(localValue);
            }
        }, 150);
        return () => clearTimeout(timer);
    }, [localValue, setSearch, search]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleFocusSearch = () => {
        inputRef.current?.focus();
        requestAnimationFrame(() => inputRef.current?.select());
    };

    const handleEscape = () => {
        if (isOpen) {
            setIsOpen(false);
        } else {
            setLocalValue("");
            setSearch("");
            inputRef.current?.blur();
        }
    };

    useKeybind("/", handleFocusSearch);
    useKeybind("f", handleFocusSearch, { ctrl: true });
    useKeybind("Escape", handleEscape);

    return (
        <div className={styles.searchContainer} ref={containerRef}>
            <input
                className={styles.input}
                ref={inputRef}
                type="text"
                placeholder={`Search ${activeCategory || "All"}...`}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
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
