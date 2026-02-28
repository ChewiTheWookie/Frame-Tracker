import React from "react";
import styles from "./CardButton.module.css";

interface CardButtonProps {
    label: string;
    activeLabel?: string;
    isActive: boolean;
    onClick: () => void;
    variant?: "default" | "mastered" | "helminth";
    className?: string;
}

export const CardButton = ({
    label,
    activeLabel,
    isActive,
    onClick,
    variant = "default",
    className = "",
}: CardButtonProps) => {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
    };

    return (
        <button
            className={`
                ${styles["action-btn"]} 
                ${isActive ? styles.active : ""} 
                ${variant === "helminth" ? styles.helminth : ""} 
                ${className}
            `}
            onClick={handleClick}
        >
            {isActive ? activeLabel || label : label}
        </button>
    );
};
