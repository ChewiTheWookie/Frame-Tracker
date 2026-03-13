import { useActiveStore } from "../../hooks/useActiveStore";
import { WeeklyTask } from "../../types/weekly";
import { Card } from "../Card/Card";
import { CardButton } from "../CardButton";
import { LiveTimer } from "../LiveTimer";
import { MapPin, Monitor, ScrollText, RefreshCw } from "lucide-react";

import styles from "./WeeklyCard.module.css";

interface Props {
    task: WeeklyTask;
}

export const WeeklyCard = ({ task }: Props) => {
    const { store } = useActiveStore();
    const { adjustTask, showAllBacks, fetchTasks } = store;

    const isCompleted = task.currentCompletions >= task.maxCompletions;
    const isAtZero = task.currentCompletions === 0;

    const TagList = task.tags && task.tags.length > 0 && (
        <div className={styles.tagContainer}>
            {task.tags.map((tag) => (
                <span
                    key={tag}
                    className={`${styles.tagBadge} ${styles[tag.toLowerCase()] || ""}`}
                >
                    {tag.toUpperCase()}
                </span>
            ))}
        </div>
    );

    const FrontContent = (
        <div
            className={`${styles.contentWrapper} ${isCompleted ? styles.mastered : ""}`}
        >
            <h4 className={styles.cardTitle}>{task.name}</h4>
            <div className={styles.timerDiv}>
                <LiveTimer
                    category={task.category}
                    interval={task.resetInterval}
                    onReset={fetchTasks}
                />
            </div>
            <div className={styles.cardInfo}>
                <div className={styles.counterOverlay}>
                    <span className={styles.counterItem}>{TagList}</span>
                    <span className={styles.counterItem}>
                        {task.currentCompletions} / {task.maxCompletions}
                    </span>
                </div>
                <div className={styles.cardActions}>
                    {!isAtZero && (
                        <CardButton
                            label="-"
                            isActive={false}
                            onClick={() => adjustTask?.(task.id, false)}
                        />
                    )}
                    <CardButton
                        label="+"
                        isActive={isCompleted}
                        activeLabel="COMPLETED"
                        onClick={() => {
                            if (!isCompleted) adjustTask?.(task.id, true);
                        }}
                    />
                </div>
            </div>
        </div>
    );

    const BackContent = (
        <div className={`${styles.contentWrapper} ${styles.back}`}>
            <h4 className={styles.cardTitle}>{task.name}</h4>

            <div className={styles.detailsList}>
                {task.location && (
                    <div className={styles.detailRow}>
                        <MapPin size={16} className={styles.detailIcon} />
                        <span>{task.location}</span>
                    </div>
                )}
                {task.terminal && (
                    <div className={styles.detailRow}>
                        <Monitor size={16} className={styles.detailIcon} />
                        <span>{task.terminal}</span>
                    </div>
                )}
                {task.questRequired && (
                    <div className={styles.detailRow}>
                        <ScrollText size={16} className={styles.detailIcon} />
                        <span>{task.questRequired}</span>
                    </div>
                )}
                <div className={styles.detailRow}>
                    <RefreshCw
                        size={16}
                        className={`${styles.detailIcon} ${styles.spinning}`}
                    />
                    <span>
                        {task.resetInterval === "8h_world"
                            ? "8 Hours"
                            : task.category}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <Card
            front={FrontContent}
            back={BackContent}
            isFlippedContent={showAllBacks}
        />
    );
};
