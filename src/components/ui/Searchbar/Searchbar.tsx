import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { getFilterDefinitions } from "@/types/filters";
import { useActionKeybind } from "@/hooks/useKeybinds";
import { useActiveStore } from "@/hooks/useActiveStore";

import styles from "./Searchbar.module.css";

export function Searchbar() {
    const useStore = useActiveStore();

    const activeCategory = useStore((s) => s.activeCategory);
    const search = useStore((s) => s.searchQuery);
    const filters = useStore((s) => s.filters);

    const setSearch = useStore((s) => s.actions.setSearch);
    const setFilters = useStore((s) => s.actions.setFilters);

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
        }, 175);
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

    const handleFilterWindow = () => {
        setIsOpen((prev) => !prev);
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

    useActionKeybind("FOCUS_SEARCH", handleFocusSearch);
    useActionKeybind("CLEAR_SEARCH", handleEscape);
    useActionKeybind("TOGGLE_FILTERS_WINDOW", handleFilterWindow);

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
                onClick={handleFilterWindow}
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
