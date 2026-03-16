import styles from "./CardButton.module.css";

interface Props {
    label?: string;
    activeLabel?: string;
    isActive?: boolean;
    onClick?: () => void;
    variant?: "default" | "helminth";
}

export function CardButton({
    label = "Complete",
    activeLabel = "Completed",
    isActive = false,
    onClick = () => {},
    variant = "default",
}: Props) {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
    };

    return (
        <button
            className={`
            ${styles.button}
            ${isActive ? styles.active : ""}
            ${variant === "default" ? "" : styles[variant.toLowerCase()]}
            `}
            onClick={handleClick}
        >
            {isActive ? activeLabel || label : label}
        </button>
    );
}
