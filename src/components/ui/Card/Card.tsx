import { useState } from "react";

import styles from "./Card.module.css";

interface Props {
    front: React.ReactNode;
    back: React.ReactNode;
    isFlipped?: boolean;
    completedStyle?: string;
    completed: boolean;
}

export function Card({
    front,
    back,
    isFlipped: externalIsFlipped,
    completedStyle = "mastered",
    completed = false,
}: Props) {
    const [internalFlipped, setInternalFlipped] = useState(false);

    const isFlipped =
        externalIsFlipped !== undefined ? externalIsFlipped : internalFlipped;

    const handleFlip = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;

        const isInteractive = !!target.closest(
            "button, a, input, [role='button']",
        );
        if (isInteractive) return;

        setInternalFlipped(!internalFlipped);
    };

    return (
        <div
            className={`${styles.card} ${isFlipped ? styles.isFlipped : ""} `}
            onClick={handleFlip}
        >
            <div
                className={`${styles.statusWrapper} ${completed ? styles[completedStyle] : ""}`}
            >
                <div className={styles.front}>{front}</div>
                <div className={styles.back}>{back}</div>
            </div>
        </div>
    );
}
