import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import styles from "./ScrollToTop.module.css";

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = (e: any) => {
            const target =
                e.target === document ? document.documentElement : e.target;
            const scrollTop = target.scrollTop || window.scrollY;

            if (scrollTop > 150) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility, true);

        return () =>
            window.removeEventListener("scroll", toggleVisibility, true);
    }, []);

    const scrollToTop = () => {
        const scrollableContainer = document.querySelector(
            `[class*="contentArea"]`,
        );

        if (scrollableContainer) {
            scrollableContainer.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <button
            className={`${styles.backToTop} ${isVisible ? styles.visible : ""}`}
            onClick={scrollToTop}
            aria-label="Back to top"
        >
            <ChevronUp size={24} strokeWidth={2.5} />
        </button>
    );
}
