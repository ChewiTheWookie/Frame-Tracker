import { DailyTask } from "../../types/dailyTask";
import { Card } from "../Card/Card";
import { CardButton } from "../CardButton";

import styles from "./DailysCard.module.css";

interface Props {
    task: DailyTask;
    onToggle: (id: string) => void;
}

export const DailysCard = ({ task, onToggle }: Props) => {
    // const FrontContent = (
    //     <div
    //         className={`${styles.contentWrapper} ${task.completed ? styles.mastered : ""}`}
    //     >
    //         <div className={styles["card-info"]}>
    //             <h4>{task.name}</h4>
    //         </div>
    //         <div className={styles["card-actions"]}>
    //             <CardButton
    //                 label="🔘 INCOMPLETE"
    //                 activeLabel="✓ DONE"
    //                 isActive={task.completed}
    //                 onClick={() => onToggle(task.id)}
    //             />
    //         </div>
    //     </div>
    // );

    // const BackContent = (
    //     <div
    //         className={`${styles.contentWrapper} ${task.completed ? styles.mastered : ""}`}
    //     >
    //         <h4 className={styles.cardBackTitle}>Task Details</h4>
    //     </div>
    // );

    // return <Card front={FrontContent} back={BackContent} />;

    const FrontContent = (
        <div
            className={`${styles.contentWrapper} ${task.completed ? styles.mastered : ""}`}
        >
            <div className={styles.header}>
                <span className={styles.categoryTag}>{task.category}</span>
                {/* A small indicator for high-priority tasks */}
                {task.category === "Sortie" && (
                    <span className={styles.factionTag}>LIVE</span>
                )}
            </div>

            <div className={styles["card-info"]}>
                <h4 className={styles.taskName}>{task.name}</h4>
                <p className={styles.taskSubtext}>
                    {task.description.split(" — ")[0]}
                </p>
            </div>

            <div className={styles["card-actions"]}>
                <CardButton
                    label="🔘 INCOMPLETE"
                    activeLabel="✓ DONE"
                    isActive={task.completed}
                    variant="default" // Using our new CardButton variants
                    onClick={() => onToggle(task.id)}
                />
            </div>
        </div>
    );

    const BackContent = (
        <div
            className={`${styles.contentWrapper} ${task.completed ? styles.mastered : ""}`}
        >
            <div className={styles.backHeader}>
                <h4 className={styles.cardBackTitle}>MISSION INTEL</h4>
            </div>

            <div className={styles.detailsBody}>
                {/* If it's a sortie, the second half of description is the Modifier */}
                {task.category === "Sortie" ? (
                    <div className={styles.modifierBox}>
                        <span className={styles.label}>MODIFIER:</span>
                        <p className={styles.modifierText}>
                            {task.description.split(" — ")[1] || "No Data"}
                        </p>
                    </div>
                ) : (
                    <p className={styles.descriptionText}>{task.description}</p>
                )}
            </div>

            <div className={styles.footer}>
                <span className={styles.idTag}>
                    ID: {task.id.toUpperCase()}
                </span>
            </div>
        </div>
    );

    return <Card front={FrontContent} back={BackContent} />;
};
