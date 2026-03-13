import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTimeStore } from "../../store/useTimeStore";

interface Props {
    category: string;
    interval: string | null;
    onReset?: () => void;
}

export const LiveTimer = ({ category, interval, onReset }: Props) => {
    const [target, setTarget] = useState<number | null>(null);
    const now = useTimeStore((state) => state.now);
    const hasResetTriggered = useRef(false);

    useEffect(() => {
        invoke<number>("get_next_reset", { category, interval }).then(
            setTarget,
        );
        hasResetTriggered.current = false;
    }, [category, interval]);

    if (target === null) return <span>...</span>;
    if (target === 0) return <span>N/A</span>;

    const diff = target - now;

    if (diff <= 0) {
        if (!hasResetTriggered.current) {
            hasResetTriggered.current = true;
            onReset?.();
        }
        return <span>Resetting...</span>;
    }

    const formatTime = (seconds: number) => {
        const d = Math.floor(seconds / 86400);
        const h = Math.floor((seconds % 86400) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (d >= 1) {
            return `${d}d ${h}h`;
        }

        return `${h}h ${m}m ${s}s`;
    };

    return <span>{formatTime(diff)}</span>;
};
