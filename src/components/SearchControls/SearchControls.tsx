import { useLocation } from "react-router-dom";
import { SaveIndicator } from "../../components/SaveIndicator";
import { StatBar } from "../../components/StatBar";
import { SearchBar } from "../../components/SearchBar";

import styles from "./SearchControls.module.css";

export function SearchControls() {
    const { pathname } = useLocation();

    switch (pathname) {
        case "/":
        case "/weekly":
            break;
        default:
            return null;
    }

    return (
        <div className={styles.searchControls}>
            <SaveIndicator />
            <SearchBar />
            <StatBar />
        </div>
    );
}
