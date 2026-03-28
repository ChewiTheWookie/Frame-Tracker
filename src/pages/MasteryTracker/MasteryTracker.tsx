import { useRef } from "react";
import {
    useMasteryStore,
    useMasteryItemIds,
    useMasteryStats,
} from "../../stores/useMasteryStore";
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
    const itemIds = useMasteryItemIds();
    const isLoading = useMasteryStore((s) => s.isLoading);
    const loadMore = useMasteryStore((s) => s.loadMore);
    const hasMore = useMasteryStore((s) => s.hasMore);
    const error = useMasteryStore((s) => s.error);

    const activeCategory = useMasteryStore((s) => s.activeCategory);
    const setCategory = useMasteryStore((s) => s.setCategory);
    const searchQuery = useMasteryStore((s) => s.searchQuery);
    const setSearch = useMasteryStore((s) => s.setSearch);
    const filters = useMasteryStore((s) => s.filters);
    const setFilters = useMasteryStore((s) => s.setFilters);

    const { current, total, helminthCurrent, helminthTotal } =
        useMasteryStats();

    const scrollRef = useRef<HTMLElement>(null);

    if (error)
        return <InfoContainer message={`Error loading Items: ${error}`} />;

    return (
        <main ref={scrollRef} className={styles.main}>
            <header className={styles.navContainer}>
                <CategoryTabs<MasteryCategory>
                    categories={MASTERY_CATEGORIES}
                    activeCategory={activeCategory}
                    onCategoryChange={setCategory}
                />
                <nav className={styles.navBottom}>
                    <Searchbar
                        search={searchQuery}
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
                        hCurrent={helminthCurrent}
                        hTotal={helminthTotal}
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
                                <MasteryCard key={id} itemId={id} />
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
