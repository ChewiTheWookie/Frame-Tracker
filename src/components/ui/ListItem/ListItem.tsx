import React, { useState, MouseEvent } from "react";

import styles from "./ListItem.module.css";
import { MoreVertical } from "lucide-react";
import { Dropdown } from "../Dropdown";

interface Props {
    icon?: React.ReactNode;
    title: React.ReactNode;
    button?: React.ReactNode;
    dropdown?: React.ReactNode;

    fontSize?: string;

    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export function ListItem({
    icon,
    title,
    button,
    dropdown,
    onClick,
    fontSize,
}: Props) {
    const [dropdownState, setDropdownState] = useState(false);

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onClick?.(e);
    };

    return (
        <div className={styles.card} onClick={handleClick}>
            <span
                className={styles.title}
                style={{
                    fontSize: fontSize,
                }}
            >
                {icon}
                {title}
            </span>
            <span className={styles.controls}>
                {button && button}
                {dropdown && (
                    <>
                        <button
                            className={styles.dropdownButton}
                            onClick={() => setDropdownState(!dropdownState)}
                        >
                            <MoreVertical size={16} />
                        </button>
                        <Dropdown
                            isOpen={dropdownState}
                            items={dropdown}
                        />
                    </>
                )}
            </span>
        </div>
    );
}
