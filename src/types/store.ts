export interface CommonTrackerState {
    searchQuery: string;
    setSearch: (query: string) => void;

    activeCategory: any;
    setCategory: (cat: any) => void;
}
