import { WeeklyTask } from "../../types/weekly";
import { useWeeklyStore } from "../../store/useWeeklyStore";
import { Card } from "../Card/Card";
import { CardButton } from "../CardButton";

import styles from "./WeeklyCard.module.css";

interface Props {
    task: WeeklyTask;
}

export const WeeklyCard = ({ task }: Props) => {
    const { adjustTask } = useWeeklyStore();

    const isDone = task.currentCompletions >= task.maxCompletions;

    const getTagColor = (tag: string) => {
        if (tag === "Trade") return "#ff4d4d";
        if (tag === "Mission") return "#00d1ff";
        if (tag === "Craft") return "#c1ac6c";
        return "#888";
    };

    const TagList = task.tags && task.tags.length > 0 && (
        <div className={styles.tagContainer}>
            {task.tags.map((tag) => (
                <span
                    key={tag}
                    className={styles.tagBadge}
                    style={{
                        borderColor: getTagColor(tag),
                        color: getTagColor(tag),
                    }}
                >
                    {tag.toUpperCase()}
                </span>
            ))}
        </div>
    );

    const statusClasses = `
        ${isDone ? styles.mastered : ""} 
        ${task.currentCompletions > 0 && !isDone ? styles.owned : ""}
    `;

    const FrontContent = (
        <div className={`${styles.contentWrapper} ${statusClasses}`}>
            <h4 className={styles.cardTitle}>{task.name}</h4>
            <div className={styles.categoryBadge}>{task.category}</div>

            <div className={styles.cardInfo}>
                <div className={styles.counterOverlay}>
                    <span className={styles.counterItem}>{TagList}</span>
                    <span className={styles.counterItem}>
                        {task.currentCompletions} / {task.maxCompletions}
                    </span>
                </div>
                <div className={styles.cardActions}>
                    <CardButton
                        label="COMPLETE"
                        activeLabel="COMPLETED"
                        isActive={isDone}
                        onClick={() => {
                            if (!isDone) adjustTask(task.id, true);
                        }}
                    />
                </div>
            </div>
        </div>
    );

    const BackContent = (
        <div className={`${styles.contentWrapper} ${statusClasses}`}>
            <h4 className={styles.cardTitle}>{task.name}</h4>
            <div className={styles.partsList}>
                <div className={styles.partRow}>
                    <span>Current: {task.currentCompletions}</span>
                </div>
                <div className={styles.partRow}>
                    <span>Limit: {task.maxCompletions}</span>
                </div>
            </div>

            <div className={styles.cardActions}>
                <CardButton
                    label="RESET PROGRESS"
                    isActive={task.currentCompletions > 0}
                    onClick={() => {
                        if (task.currentCompletions > 0) {
                            adjustTask(task.id, false);
                        }
                    }}
                />
            </div>
        </div>
    );

    return <Card front={FrontContent} back={BackContent} />;
};
