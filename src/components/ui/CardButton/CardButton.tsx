import { ReactNode, MouseEvent } from "react";

import styles from "./CardButton.module.css";

interface Props {
    label?: ReactNode;
    activeLabel?: ReactNode;
    isActive?: boolean;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    variant?: "default" | "helminth";
}

export function CardButton({
    label = "Complete",
    activeLabel = "Completed",
    isActive = false,
    onClick = () => {},
    variant = "default",
}: Props) {
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onClick?.(e);
    };

    return (
        <button
            type="button"
            className={`
                ${styles.button}
                ${isActive ? styles.active : ""}
                ${styles[variant]} 
            `}
            onClick={handleClick}
        >
            {isActive ? (activeLabel ?? label) : label}
        </button>
    );
}
