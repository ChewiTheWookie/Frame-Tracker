import { useInventoryStore } from "../../store/useInventoryStore";
import { Save } from "lucide-react";

import styles from "./SaveIndicator.module.css";

export function SaveIndicator() {
    const saving = useInventoryStore((state) => state.saving);

    return (
        <>
            {saving && (
                <div className={styles.indicatorContainer}>
                    <div className={styles.saveIndicator}>
                        <Save size={16} className={styles.spinningIcon} />
                        Saving Data
                    </div>
                </div>
            )}
        </>
    );
}
