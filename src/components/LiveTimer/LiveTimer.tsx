import { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

// import styles from "./LiveTimer.module.css";

interface Props {
    category: string;
    interval: string | null;
    onReset?: () => void;
}

export const LiveTimer = ({ category, interval, onReset }: Props) => {
    const [display, setDisplay] = useState("...");
    const onResetRef = useRef(onReset);

    useEffect(() => {
        onResetRef.current = onReset;
    }, [onReset]);

    useEffect(() => {
        let timerId: number;

        const startTimer = async () => {
            try {
                const targetTimestamp = await invoke<number>("get_next_reset", {
                    category,
                    interval,
                });

                if (!targetTimestamp || targetTimestamp === 0) {
                    setDisplay("N/A");
                    return;
                }

                const runCountdown = () => {
                    const now = Math.floor(Date.now() / 1000);
                    const diff = targetTimestamp - now;

                    if (diff <= 0) {
                        setDisplay("Resetting...");
                        onResetRef.current?.();
                        return;
                    }

                    const h = Math.floor(diff / 3600);
                    const m = Math.floor((diff % 3600) / 60);
                    const s = diff % 60;

                    setDisplay(`${h}h ${m}m ${s}s`);
                    timerId = window.setTimeout(runCountdown, 1000);
                };

                runCountdown();
            } catch (err) {
                console.error("Timer failed:", err);
                setDisplay("Error");
            }
        };

        startTimer();

        return () => {
            if (timerId) clearTimeout(timerId);
        };
    }, [category, interval]);

    return <span>{display}</span>;
};
