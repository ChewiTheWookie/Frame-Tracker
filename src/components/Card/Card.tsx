import { useState, ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps {
    front: ReactNode;
    back: ReactNode;
    isFlippedContent?: boolean;
    className?: string;
    containerStyles?: string;
}

export const Card = ({
    front,
    back,
    isFlippedContent,
    className,
    containerStyles,
}: CardProps) => {
    const [isManualFlip, setIsManualFlip] = useState(false);

    const flipped = isFlippedContent || isManualFlip;

    const handleFlip = () => setIsManualFlip(!isManualFlip);

    return (
        <div
            className={`${styles.cardContainer} ${flipped ? styles.isFlipped : ""} ${className}`}
            onClick={handleFlip}
        >
            <div className={`${styles.cardInner} ${containerStyles}`}>
                <div className={styles.cardFront}>{front}</div>
                <div className={styles.cardBack}>{back}</div>
            </div>
        </div>
    );
};
