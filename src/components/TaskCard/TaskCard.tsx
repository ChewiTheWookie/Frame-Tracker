import { memo } from "react";
import { MapPin, Monitor, RefreshCw, ScrollText, Star } from "lucide-react";
import { useTaskTimer } from "../../hooks/useTaskTimer";
import { Task } from "../../types/tasks";
import { Card } from "../Card";
import { CardButton } from "../CardButton";

import styles from "./TaskCard.module.css";

interface Props {
    task: Task;
    set_task: (taskId: string, newValue: number) => void;
    toggleFavorite: (taskId: string) => void;
}

export function InternalTaskCard({ task, set_task, toggleFavorite }: Props) {
    const countdown = useTaskTimer(task);

    const handleUpdate = (newValue: number) => {
        const clamped = Math.max(0, Math.min(newValue, task.max_completions));
        set_task(task.id, clamped);
    };

    const handleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log(task.name + " Was marked as Fav");
        toggleFavorite(task.id);
    };

    const tags: string[] = JSON.parse(task.tags || "[]");
    const isCompleted = task.current_completions >= task.max_completions;
    const isFavorite = task.favorite;

    const formatInterval = (interval: string) => {
        return interval
            .replace(/Daily_\d+/gi, "Daily")
            .replace(/(\d+)d/g, "$1 Days")
            .replace(/(\d+)h/g, "$1 Hours")
            .replace(/(\d+)m/g, "$1 Minutes")
            .replace(/_world/g, "")
            .replace(/baro/g, "14 Days")
            .trim();
    };

    const front = (
        <>
            <div className={styles.header}>
                <h4 className={styles.name}>{task.name}</h4>
                <div className={styles.timer}>{countdown && countdown}</div>
                <button
                    className={`${styles.favoriteBtn} ${isFavorite ? styles.isFavorite : ""}`}
                    onClick={handleFavorite}
                >
                    <Star className={styles.favoriteIcon} size={18} />
                </button>
            </div>

            <div className={styles.footer}>
                <div className={styles.statContainer}>
                    <div className={styles.tagContainer}>
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className={`${styles.statItem} ${styles.tag} ${styles[tag.toLowerCase()]}`}
                            >
                                {tag.toUpperCase()}
                            </span>
                        ))}
                    </div>
                    <span className={styles.statItem}>
                        {task.current_completions} / {task.max_completions}
                    </span>
                </div>
                <div className={styles.controls}>
                    {task.current_completions !== 0 && (
                        <CardButton
                            label="Undo"
                            onClick={() =>
                                handleUpdate(task.current_completions - 1)
                            }
                        />
                    )}
                    <CardButton
                        isActive={isCompleted}
                        onClick={() =>
                            handleUpdate(task.current_completions + 1)
                        }
                    />
                </div>
            </div>
        </>
    );

    const back = (
        <>
            <h4 className={styles.name}>{task.name}</h4>
            <div className={styles.infoContainer}>
                {task.location && (
                    <div className={styles.infoItem}>
                        <MapPin size={16} className={styles.detailIcon} />
                        <span>{task.location || "Unknown"}</span>
                    </div>
                )}
                {task.terminal && (
                    <div className={styles.infoItem}>
                        <Monitor size={16} className={styles.detailIcon} />
                        <span>{task.terminal || "N/A"}</span>
                    </div>
                )}
                {task.quest_required && (
                    <div className={styles.infoItem}>
                        <ScrollText size={16} className={styles.detailIcon} />
                        <span>{task.quest_required || "None"}</span>
                    </div>
                )}
                {task.reset_interval && (
                    <div className={styles.infoItem}>
                        <RefreshCw
                            size={16}
                            className={`${styles.detailIcon} ${styles.spin}`}
                        />
                        <span>{formatInterval(task.reset_interval)}</span>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <Card
            front={front}
            back={back}
            completed={task.current_completions === task.max_completions}
        />
    );
}

export const TaskCard = memo(InternalTaskCard);
