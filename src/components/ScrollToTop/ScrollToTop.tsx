import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import styles from "./ScrollToTop.module.css";

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
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
