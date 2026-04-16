import React, { useState } from "react";

import styles from "./ListItem.module.css";
import { MoreVertical } from "lucide-react";

interface Props {
    icon?: React.ReactNode;
    title: React.ReactNode;
    button?: React.ReactNode;
    dropdown?: React.ReactNode;
}

export function ListItem({ icon, title, button, dropdown }: Props) {
    const [dropdownState, setDropdownState] = useState(false);

    return (
        <div className={styles.card}>
            <span className={styles.title}>
                {icon}
                {title}
            </span>
            <span className={styles.controls}>
                {button && button}
                {dropdown && (
                    <div className={styles.dropdownContainer}>
                        <button
                            className={styles.dropdownButton}
                            onClick={() => setDropdownState(!dropdownState)}
                        >
                            <MoreVertical size={16} />
                        </button>
                        {dropdownState && dropdown}
                    </div>
                )}
            </span>
        </div>
    );
}
