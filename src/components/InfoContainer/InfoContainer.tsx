import styles from "./InfoContainer.module.css";

interface Prop {
    message: string;
}

export function InfoContainer({ message }: Prop) {
    return (
        <div className={styles.container}>
            <span className={styles.message}>{message}</span>
        </div>
    );
}
