import { memo, useMemo } from "react";
import { MapPin, Monitor, RefreshCw, ScrollText, Star } from "lucide-react";
import { useTaskTimer } from "@/hooks/useTaskTimer";
import { useTaskById, useTaskActions } from "@/stores/useTaskStore";
import { Card } from "@/components/ui/Card";
import { CardButton } from "@/components/ui/CardButton";

import styles from "./TaskCard.module.css";

interface Props {
    taskId: string;
}

function InternalTaskCard({ taskId }: Props) {
    const task = useTaskById(taskId);
    const { setTask, toggleFavorite } = useTaskActions();

    const countdown = useTaskTimer(task);

    if (!task) return null;

    const handleUpdate = (newValue: number) => {
        const clamped = Math.max(0, Math.min(newValue, task.max_completions));
        setTask(task.id, clamped);
    };

    const { tags, isCompleted, isFavorite } = useMemo(() => {
        const parsedTags: string[] = JSON.parse(task.tags || "[]");

        return {
            tags: parsedTags,
            isCompleted: task.current_completions >= task.max_completions,
            isFavorite: task.favorite === 1,
        };
    }, [
        task.tags,
        task.current_completions,
        task.max_completions,
        task.favorite,
    ]);

    const frontHeader = (
        <>
            <h4 className={styles.name}>{task.name}</h4>
            <div className={styles.timer}>{countdown}</div>
            <button
                className={`${styles.favoriteBtn} ${isFavorite ? styles.isFavorite : ""}`}
                onClick={() => toggleFavorite(task.id)}
            >
                <Star className={styles.favoriteIcon} size={18} />
            </button>
        </>
    );

    const frontControls = (
        <>
            <div className={styles.statContainer}>
                <div className={styles.tagContainer}>
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className={`${styles.statItem} ${styles.tag} ${styles[tag.toLowerCase()] || ""}`}
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
                    onClick={() => handleUpdate(task.current_completions + 1)}
                />
            </div>
        </>
    );

    const backList = (
        <>
            {task.location && (
                <div className={styles.listRow}>
                    <MapPin size={16} className={styles.listItemIcon} />
                    <span> {task.location}</span>
                </div>
            )}
            {task.terminal && (
                <div className={styles.listRow}>
                    <Monitor size={16} className={styles.listItemIcon} />
                    <span> {task.terminal}</span>
                </div>
            )}
            {task.quest_required && (
                <div className={styles.listRow}>
                    <ScrollText size={16} className={styles.listItemIcon} />
                    <span> {task.quest_required}</span>
                </div>
            )}
            {task.reset_interval && (
                <div className={styles.listRow}>
                    <RefreshCw
                        size={16}
                        className={`${styles.listItemIcon} ${styles.spin}`}
                    />
                    <span> {formatInterval(task.reset_interval)}</span>
                </div>
            )}
        </>
    );

    return (
        <Card
            title={task.name}
            frontHeader={frontHeader}
            frontControls={frontControls}
            backList={backList}
            completed={isCompleted}
        />
    );
}

export const TaskCard = memo(InternalTaskCard);

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
