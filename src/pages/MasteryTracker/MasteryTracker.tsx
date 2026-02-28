import { useEffect, useMemo } from "react";
import { useInventoryStore } from "../../store/useInventoryStore";
import { InventoryCard } from "../../components/InventoryCard";
import { Grid } from "../../components/Grid";

// import styles from "./MasteryTracker.module.css";

export function MasteryTracker() {
    const items = useInventoryStore((state) => state.items);
    const search = useInventoryStore((state) => state.search);
    const fetchWikiData = useInventoryStore((state) => state.fetchWikiData);
    const activeCategory = useInventoryStore((state) => state.activeCategory);
    const filters = useInventoryStore((state) => state.filters);

    useEffect(() => {
        fetchWikiData();
    }, [fetchWikiData]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const isActuallyCraftable =
                item.craftable && !item.owned && !item.mastered;
            const isActuallyOwned =
                item.owned ||
                item.mastered ||
                item.helminthed ||
                item.craftable;

            const matchesCategory =
                activeCategory === "All" || item.category === activeCategory;
            const matchesSearch = item.name
                .toLowerCase()
                .includes(search.toLowerCase());
            const matchesNonPrimes =
                !filters.nonPrimesOnly || !item.name.includes("Prime");
            const matchesPrimes =
                !filters.primesOnly || item.name.includes("Prime");
            const matchesHideFed = !filters.hideFed || !item.helminthed;
            const matchHideMastered = !filters.hideOwned || !item.mastered;
            const matchHideUnOwned = !filters.hideUnowned || isActuallyOwned;
            const matchCraftable =
                !filters.craftableOnly || !isActuallyCraftable;
            const matchShowOnwed = !filters.ownedOnly || !item.owned;

            return (
                matchesCategory &&
                matchesSearch &&
                matchesNonPrimes &&
                matchesPrimes &&
                matchesHideFed &&
                matchHideMastered &&
                matchHideUnOwned &&
                matchCraftable &&
                matchShowOnwed
            );
        });
    }, [items, search, activeCategory, filters]);

    return (
        <Grid>
            {filteredItems.map((item) => (
                <InventoryCard key={item.id} item={item} />
            ))}
        </Grid>
    );
}
