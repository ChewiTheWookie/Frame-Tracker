import { useInventoryStore } from "../../store/useInventoryStore";

import styles from "./SaveIndicator.module.css";

export function SaveIndicator() {
    const saving = useInventoryStore((state) => state.saving);

    return (
        <>
            {saving && (
                <div className={styles.indicatorContainer}>
                    <div className={styles.saveIndicator}>
                        <span>⏳</span>
                        Saving Data
                    </div>
                </div>
            )}
        </>
    );
}
