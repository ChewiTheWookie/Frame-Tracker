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

    const statusClasses = `
        ${isDone ? styles.mastered : ""} 
        ${task.currentCompletions > 0 && !isDone ? styles.owned : ""}
    `;

    const FrontContent = (
        <div className={`${styles.contentWrapper} ${statusClasses}`}>
            <h4 className={styles.cardTitle}>{task.name}</h4>
            <div className={styles.categoryBadge}>{task.category}</div>

            <div className={styles["card-info"]}>
                <div className={styles.counterOverlay}>
                    {task.currentCompletions} / {task.maxCompletions}
                </div>
                <div className={styles["card-actions"]}>
                    <CardButton
                        label="INCOMPLETE"
                        activeLabel="COMPLETE"
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

            <div className={styles["card-actions"]}>
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
