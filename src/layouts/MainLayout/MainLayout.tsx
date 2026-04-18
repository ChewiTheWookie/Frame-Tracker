import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "../Navbar";
import { ROUTE_METADATA } from "@/routes/metadata";
import { CategoryTabs } from "@/components/ui/CategoryTabs";
import { Searchbar } from "@/components/ui/Searchbar";
import { StatBar } from "@/components/ui/StatBar";

import styles from "./MainLayout.module.css";

export function MainLayout() {
    const { pathname } = useLocation();
    const metadata = ROUTE_METADATA[pathname];

    const showMainSearch = metadata?.hasSearch && !metadata?.useInternalSearch;

    const hasHeaderContent =
        metadata?.hasCategory || showMainSearch || metadata?.hasStatBar;

    return (
        <>
            <Navbar />
            <main className={styles.mainContainer}>
                {hasHeaderContent && (
                    <header className={styles.navContainer}>
                        {metadata?.hasCategory && <CategoryTabs />}
                        <nav className={styles.navBottom}>
                            {showMainSearch && <Searchbar />}
                            {metadata?.hasStatBar && <StatBar />}
                        </nav>
                    </header>
                )}

                <Outlet />
            </main>
        </>
    );
}
