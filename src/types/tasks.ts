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
}
