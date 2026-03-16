import { useMemo } from "react";
import { useTimeStore } from "../stores/useTimeStore";
import { Task } from "../types/tasks";

export function useTaskTimer(task: Task) {
    const now = useTimeStore((state) => state.now);

    return useMemo(() => {
        const interval = (task.reset_interval || "").toLowerCase();

        const formatSeconds = (secs: number) => {
            if (secs <= 0) return "00:00:00";
            if (secs >= 86400) {
                const d = Math.floor(secs / 86400);
                const h = Math.floor((secs % 86400) / 3600);
                const m = Math.floor((secs % 3600) / 60);
                return `${d}d ${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m`;
            }
            const h = Math.floor(secs / 3600);
            const m = Math.floor((secs % 3600) / 60);
            const s = secs % 60;
            return [h, m, s]
                .map((v) => v.toString().padStart(2, "0"))
                .join(":");
        };

        if (interval.startsWith("daily")) {
            const hourPart = interval.split("_")[1];
            const resetHour = hourPart ? parseInt(hourPart, 10) : 0;

            const date = new Date(now * 1000);
            const nextReset =
                Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate(),
                    resetHour,
                    0,
                    0,
                ) / 1000;

            let target = nextReset;
            if (now >= nextReset) {
                target += 86400;
            }

            return formatSeconds(target - now);
        }

        if (interval === "weekly") {
            const date = new Date(now * 1000);
            const dayOfWeek = date.getUTCDay();
            const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
            const nextMonday =
                (Math.floor(now / 86400) + daysUntilMonday) * 86400;
            return formatSeconds(nextMonday - now);
        }

        if (!task.last_reset) return null;

        const isRolling =
            !interval.endsWith("_world") &&
            interval !== "baro" &&
            !interval.startsWith("daily");

        if (isRolling && task.current_completions < task.max_completions) {
            return null;
        }

        let intervalSecs = 0;
        if (interval === "baro") {
            const anchor = 1772802000;
            const intervalSecs = 14 * 24 * 60 * 60;

            const currentSeconds = Math.max(now, Math.floor(Date.now() / 1000));
            const elapsed = currentSeconds - anchor;

            const cycleStart =
                anchor + Math.floor(elapsed / intervalSecs) * intervalSecs;
            const departureTime = cycleStart + 48 * 3600;

            if (currentSeconds < departureTime) {
                return `Leaves in: ${formatSeconds(departureTime - currentSeconds)}`;
            } else {
                const nextArrival = cycleStart + intervalSecs;
                return formatSeconds(nextArrival - currentSeconds);
            }
        } else {
            const match = interval.match(/^(\d+)([dhm])/);
            if (match) {
                const value = parseInt(match[1], 10);
                const unit = match[2];
                if (unit === "d") intervalSecs = value * 86400;
                else if (unit === "h") intervalSecs = value * 3600;
                else if (unit === "m") intervalSecs = value * 60;
            }
        }

        const sanitizedDate = task.last_reset.includes("T")
            ? task.last_reset
            : task.last_reset.replace(" ", "T") + "Z";

        const parsedTime = Date.parse(sanitizedDate);
        const resetTs = isNaN(parsedTime) ? 0 : Math.floor(parsedTime / 1000);
        const currentSeconds = Math.max(now, Math.floor(Date.now() / 1000));
        const secondsRemaining = resetTs + intervalSecs - currentSeconds;

        if (resetTs === 0 || secondsRemaining <= 0) return null;

        return formatSeconds(secondsRemaining);
    }, [
        now,
        task.last_reset,
        task.reset_interval,
        task.current_completions,
        task.max_completions,
    ]);
}
