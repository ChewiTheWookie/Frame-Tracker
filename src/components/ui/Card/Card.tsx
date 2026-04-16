import { useState } from "react";

import styles from "./Card.module.css";

interface Props {
    title: string;
    frontHeader?: React.ReactNode;
    frontControls?: React.ReactNode;

    backList?: React.ReactNode;
    backControls?: React.ReactNode;

    isFlipped?: boolean;
    completedStyle?: string;
    completed: boolean;
}

export function Card({
    title,
    frontHeader,
    frontControls,
    backList,
    backControls,
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
                <div className={styles.front}>
                    {frontHeader && frontHeader}
                    {frontControls && (
                        <div className={styles.frontControls}>
                            {frontControls}
                        </div>
                    )}
                </div>
                <div className={styles.back}>
                    <h4 className={styles.title}>{title}</h4>
                    {backList && (
                        <div className={styles.backList}>{backList}</div>
                    )}
                    {backControls && (
                        <div className={styles.backControls}>
                            {backControls}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
