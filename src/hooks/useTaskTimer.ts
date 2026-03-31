import { useMemo } from "react";
import { useTimeStore } from "@/stores/useTimeStore";
import { Task } from "@/types/tasks";

export function useTaskTimer(task: Task) {
    const now = useTimeStore((state) => state.now);

    return useMemo(() => {
        const interval = (task.reset_interval || "").toLowerCase();
        if (!interval) return null;

        const isRolling =
            !interval.endsWith("_world") &&
            interval !== "baro" &&
            !interval.startsWith("daily") &&
            interval !== "weekly";

        if (isRolling && task.current_completions < task.max_completions) {
            return null;
        }

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

            let target =
                Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate(),
                    resetHour,
                    0,
                    0,
                ) / 1000;

            if (now >= target) target += 86400;
            return formatSeconds(target - now);
        }

        if (interval === "weekly") {
            const date = new Date(now * 1000);
            const dayOfWeek = date.getUTCDay();
            const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

            const nextMonday =
                Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate() + daysUntilMonday,
                    0,
                    0,
                    0,
                ) / 1000;

            return formatSeconds(nextMonday - now);
        }

        if (interval === "baro") {
            const anchor = 1772802000;
            const cycleSecs = 1209600;
            const elapsed = now - anchor;
            const cycleStart =
                anchor + Math.floor(elapsed / cycleSecs) * cycleSecs;
            const departureTime = cycleStart + 172800;

            if (now < departureTime) {
                return `Leaves: ${formatSeconds(departureTime - now)}`;
            }
            return formatSeconds(cycleStart + cycleSecs - now);
        }

        if (!task.last_reset) return null;

        let intervalSecs = 0;
        const match = interval.match(/^(\d+)([dhm])/);
        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2];
            intervalSecs =
                unit === "d"
                    ? value * 86400
                    : unit === "h"
                      ? value * 3600
                      : value * 60;
        }

        const sanitizedDate = task.last_reset.includes("T")
            ? task.last_reset
            : task.last_reset.replace(" ", "T") + "Z";
        const resetTs = Math.floor(Date.parse(sanitizedDate) / 1000);
        const secondsRemaining = resetTs + intervalSecs - now;

        return secondsRemaining > 0 ? formatSeconds(secondsRemaining) : null;
    }, [
        now,
        task.last_reset,
        task.reset_interval,
        task.current_completions,
        task.max_completions,
    ]);
}
