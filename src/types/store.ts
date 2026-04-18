export interface BaseState<T, F, S, C> {
    items: Record<string, T>;
    itemIds: string[];
    stats: S;
    isLoading: boolean;
    isFetchingMore: boolean;
    error: string | null;
    page: number;
    hasMore: boolean;
    activeCategory: C;
    searchQuery: string;
    filters: F;
}
