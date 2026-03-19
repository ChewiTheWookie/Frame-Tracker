import { useRef } from "react";
import { useMasteryStore } from "../../stores/useMasteryStore";
import { MASTERY_CATEGORIES, MasteryCategory } from "../../types/categories";
import { CardGrid } from "../../components/CardGrid";
import { MasteryCard } from "../../components/MasteryCard";
import { Throbber } from "../../components/Throbber";
import { CategoryTabs } from "../../components/CategoryTabs";
import { Searchbar } from "../../components/Searchbar";
import { StatBar } from "../../components/StatBar";
import { ScrollSentinel } from "../../components/ScrollSentinel";
import { InfoContainer } from "../../components/InfoContainer";
import { ScrollToTop } from "../../components/ScrollToTop";

import styles from "./MasteryTracker.module.css";

export function MasteryTracker() {
    const itemIds = useMasteryStore((state) => state.itemIds);
    const items = useMasteryStore((state) => state.items);
    const isLoading = useMasteryStore((state) => state.isLoading);
    const loadMore = useMasteryStore((s) => s.loadMore);
    const hasMore = useMasteryStore((s) => s.hasMore);
    const error = useMasteryStore((state) => state.error);
    const activeCategory = useMasteryStore((state) => state.activeCategory);
    const toggleMastery = useMasteryStore((state) => state.toggleMastery);
    const updateComponentQuantity = useMasteryStore(
        (state) => state.updateComponentQuantity,
    );

    const current = useMasteryStore((state) => state.stats.current);
    const total = useMasteryStore((state) => state.stats.total);
    const hCurrent = useMasteryStore((state) => state.stats.helminthCurrent);
    const hTotal = useMasteryStore((state) => state.stats.helminthTotal);

    const setCategory = useMasteryStore((state) => state.setCategory);
    const search = useMasteryStore((state) => state.searchQuery);
    const setSearch = useMasteryStore((state) => state.setSearch);
    const filters = useMasteryStore((state) => state.filters);
    const setFilters = useMasteryStore((state) => state.setFilters);

    const scrollRef = useRef<HTMLElement>(null);

    if (error)
        return <InfoContainer message={`Error loading Items: ${error}`} />;

    return (
        <main ref={scrollRef} className={styles.main}>
            <header className={styles.navContainer}>
                <CategoryTabs<MasteryCategory>
                    categories={MASTERY_CATEGORIES}
                    activeCategory={activeCategory as MasteryCategory}
                    onCategoryChange={setCategory}
                />
                <nav className={styles.navBottom}>
                    <Searchbar
                        search={search}
                        setSearch={setSearch}
                        activeCategory={activeCategory}
                        filters={filters}
                        setFilters={setFilters}
                    />
                    <StatBar
                        label="Mastered"
                        current={current}
                        total={total}
                        hLabel="Helminthed"
                        hCurrent={hCurrent}
                        hTotal={hTotal}
                    />
                </nav>
            </header>
            <div className={styles.scrollContainer}>
                {isLoading && itemIds.length === 0 ? (
                    <Throbber label="Loading Items" />
                ) : (
                    <>
                        <CardGrid>
                            {itemIds.map((id) => (
                                <MasteryCard
                                    key={id}
                                    item={items[id]}
                                    toggleMastery={toggleMastery}
                                    updateComponentQuantity={
                                        updateComponentQuantity
                                    }
                                />
                            ))}
                        </CardGrid>
                        <ScrollSentinel
                            isLoading={isLoading}
                            hasMore={hasMore}
                            loadMore={loadMore}
                            rootRef={scrollRef}
                        />
                    </>
                )}
            </div>
            <ScrollToTop />
        </main>
    );
}
