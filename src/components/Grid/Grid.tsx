import { ReactNode } from "react";
import styles from "./Grid.module.css";

interface GridProps {
    children: ReactNode;
}

export function Grid({ children }: GridProps) {
    return <div className={styles.grid}>{children}</div>;
}
