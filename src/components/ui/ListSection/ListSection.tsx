import styles from "./ListSection.module.css";

interface Props {
    icon?: React.ReactNode;
    title: React.ReactNode;
    list?: React.ReactNode;
}

export function ListSection({ icon, title, list }: Props) {
    return (
        <section className={styles.section}>
            <h2 className={styles.title}>{icon} {title}</h2>
            <div className={styles.list}>
                {list}
            </div>
        </section>
    )
}