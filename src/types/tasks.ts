export interface Task {
    id: string;
    name: string;
    category: string;
    current_completions: number;
    max_completions: number;
    last_reset: string;
    tags: string | null;
    reset_interval: string | null;
    location: string | null;
    terminal: string | null;
    quest_required: string | null;
    icon: string | null;
    favorite: number;
}

export interface TaskStats {
    current: number;
    total: number;
}

export const ARCHIMEDEA_IDS = [
    "deep_archimedea",
    "elite_deep_archimedea",
    "elite_temporal_archimedea",
];
export const PULSE_COST = 2;
export const MAX_PULSES = 5;
