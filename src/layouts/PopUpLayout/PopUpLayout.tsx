import { useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { ROUTE_METADATA } from "@/routes/metadata";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { Searchbar } from "@/components/ui/Searchbar";

import styles from "./PopUpLayout.module.css";

export interface PopupLayoutContext {
    scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function PopUpLayout() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const scrollRef = useRef<HTMLDivElement>(null);

    const metadata = ROUTE_METADATA[pathname];

    return (
        <div className={styles.blurContainer}>
            <div className={styles.pageContainer}>
                <header className={styles.header}>
                    <h1 className={styles.title}>{metadata.label}</h1>
                    <button
                        className={styles.closeBtn}
                        onClick={() => navigate(-1)}
                    >
                        <X size={20} className={styles.closeIcon} />
                    </button>
                    <nav className={styles.navBottom}>
                        {metadata?.hasSearch && <Searchbar />}
                    </nav>
                </header>
                <div className={styles.scrollContainer} ref={scrollRef}>
                    <Outlet
                        context={
                            {
                                scrollRef,
                            } satisfies PopupLayoutContext
                        }
                    />
                    <ScrollToTop targetRef={scrollRef} />
                </div>
            </div>
        </div>
    );
}
