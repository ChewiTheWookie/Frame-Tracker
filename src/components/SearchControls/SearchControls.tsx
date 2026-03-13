import { useLocation } from "react-router-dom";
import { SaveIndicator } from "../../components/SaveIndicator";
import { StatBar } from "../../components/StatBar";
import { SearchBar } from "../../components/SearchBar";

import styles from "./SearchControls.module.css";
import { CategoryTabs } from "../CategoryTabs";
import { ROUTE_REGISTRY } from "../../routes/metadata";

export function SearchControls() {
    const { pathname } = useLocation();
    const meta = ROUTE_REGISTRY[pathname];

    if (!meta) return null;

    const { tabs, saveIndicator, searchBar, stats } = meta.features;

    const showAnything = tabs || saveIndicator || searchBar || stats;
    if (!showAnything) return null;

    return (
        <nav className={styles.searchNav}>
            {tabs && <CategoryTabs />}

            {(saveIndicator || searchBar || stats) && (
                <div className={styles.searchControls}>
                    {saveIndicator && <SaveIndicator />}
                    {searchBar && <SearchBar />}
                    {stats && <StatBar />}
                </div>
            )}
        </nav>
    );
}
