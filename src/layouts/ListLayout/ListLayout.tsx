import { useRef, useState, ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ROUTE_METADATA } from "@/routes/metadata";
import { PATHS } from "@/routes/paths";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { Searchbar } from "@/components/ui/Searchbar";

import styles from "./ListLayout.module.css";

export interface ListLayoutContext {
    scrollRef: React.RefObject<HTMLDivElement | null>;
    setHeaderAction: (action: React.ReactNode) => void;
}

export function ListLayout() {
    const { pathname } = useLocation();
    const metadata = ROUTE_METADATA[pathname];
    const scrollRef = useRef<HTMLDivElement>(null);

    const [headerAction, setHeaderAction] = useState<ReactNode>(null);

    let isProfilePage = false;
    if (pathname === PATHS.Profile) {
        isProfilePage = true;
    }

    return (
        <div
            className={`${styles.contentContainer} ${isProfilePage ? styles.profile : ""}`}
        >
            <header className={styles.header}>
                <h2 className={styles.title}>{metadata?.label}</h2>
                <span className={styles.actionSlot}>{headerAction}</span>
                {metadata?.hasSearch && (
                    <nav className={styles.navBottom}>
                        {metadata?.hasSearch && <Searchbar />}
                    </nav>
                )}

            </header>
            <div className={styles.scrollContainer} ref={scrollRef}>
                <Outlet
                    context={
                        {
                            scrollRef,
                            setHeaderAction,
                        } satisfies ListLayoutContext
                    }
                />
                <ScrollToTop targetRef={scrollRef} />
            </div>
        </div>
    );
}
