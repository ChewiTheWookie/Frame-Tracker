import styles from "./Throbber.module.css";

export function Throbber() {
    return (
        <div className={styles.initialLoader}>
            <div className={styles.throbber} />
            <p>LOADING DATA...</p>
        </div>
    );
}
