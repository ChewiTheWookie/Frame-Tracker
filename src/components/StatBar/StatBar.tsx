import styles from "./StatBar.module.css";

interface Props {
    label: string;
    current: number;
    total: number;

    hLabel?: string;
    hCurrent?: number;
    hTotal?: number;
}

export const StatBar = ({
    label,
    current,
    total,
    hLabel,
    hCurrent,
    hTotal,
}: Props) => {
    return (
        <div className={styles.statContainer}>
            <div className={styles.item}>
                <span className={styles.label}>{label}</span>
                <span className={styles.value}>
                    {current}
                    <span>/{total}</span>
                </span>
            </div>

            {hTotal !== undefined && hTotal > 0 && (
                <>
                    <div className={styles.divider} />
                    <div className={styles.item}>
                        <span className={styles.label}>{hLabel}</span>
                        <span className={styles.value}>
                            {hCurrent}
                            <span>/{hTotal}</span>
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};
