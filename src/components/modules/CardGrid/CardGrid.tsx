import { ReactNode } from "react";

import styles from "./CardGrid.module.css";

interface Props {
    children: ReactNode;
}

export function CardGrid({ children }: Props) {
    return <div className={styles.cardGrid}>{children}</div>;
}
