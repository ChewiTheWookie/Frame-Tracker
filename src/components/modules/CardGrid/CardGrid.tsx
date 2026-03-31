import { forwardRef, ReactNode } from "react";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

import styles from "./CardGrid.module.css";

interface Props {
    children: ReactNode;
}

export const CardGrid = forwardRef<HTMLDivElement, Props>(
    ({ children }, ref) => {
        return (
            <div ref={ref} className={styles.cardGrid}>
                {children}
                <ScrollToTop
                    targetRef={ref as React.RefObject<HTMLDivElement>}
                />
            </div>
        );
    },
);
