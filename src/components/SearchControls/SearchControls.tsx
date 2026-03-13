import { useLocation } from "react-router-dom";
import { ROUTE_REGISTRY } from "../../routes/metadata";
import { SaveIndicator } from "../SaveIndicator";
import { StatBar } from "../StatBar";
import { SearchBar } from "../SearchBar";
import { CategoryTabs } from "../CategoryTabs";

import styles from "./SearchControls.module.css";

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
