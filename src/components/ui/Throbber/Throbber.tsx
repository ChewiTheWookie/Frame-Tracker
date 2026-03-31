import styles from "./Throbber.module.css";

interface Props {
    label?: string;
}

export function Throbber({ label = "Loading Data" }: Props) {
    return (
        <div className={styles.componentContainer}>
            <div className={styles.throbber} />
            <p className={styles.label}>{label}...</p>
        </div>
    );
}
