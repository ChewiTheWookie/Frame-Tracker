import { SaveIndicator } from "../../components/SaveIndicator";
import { StatBar } from "../../components/StatBar";
import { SearchBar } from "../../components/SearchBar";

import styles from "./SearchControls.module.css";

export function SearchControls() {
    return (
        <div className={styles.searchControls}>
            <SaveIndicator />
            <SearchBar />
            <StatBar />
        </div>
    );
}
