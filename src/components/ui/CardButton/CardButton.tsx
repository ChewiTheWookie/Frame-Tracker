import { ReactNode, MouseEvent } from "react";

import styles from "./CardButton.module.css";

interface Props {
    label?: ReactNode;
    activeLabel?: ReactNode;
    isActive?: boolean;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    variant?: "default" | "helminth";
    width?: string;
    height?: string;
}

export function CardButton({
    label = "Complete",
    activeLabel = "Completed",
    isActive = false,
    onClick = () => {},
    variant = "default",
    width,
    height,
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
            style={{
                width: width,
                height: height,
            }}
        >
            {isActive ? (activeLabel ?? label) : label}
        </button>
    );
}
