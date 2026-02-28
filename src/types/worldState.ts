export interface SortieVariant {
    node: string;
    missionType: string;
    modifier: string;
}

export interface WorldState {
    sortie: {
        boss: string;
        faction: string;
        variants: SortieVariant[];
        eta: string;
    };
    cetusCycle: {
        isDay: boolean;
        timeLeft: string;
    };
}
