import { useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";

import styles from "./ScrollToTop.module.css";

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const scrollContainer = buttonRef.current?.parentElement;

        if (!scrollContainer) return;

        const handleScroll = () => {
            if (scrollContainer.scrollTop > 200) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        scrollContainer.addEventListener("scroll", handleScroll);

        handleScroll();

        return () =>
            scrollContainer.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        const scrollContainer = buttonRef.current?.parentElement;
        if (scrollContainer) {
            scrollContainer.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    return (
        <button
            ref={buttonRef}
            onClick={scrollToTop}
            className={`${styles.button} ${isVisible ? styles.visible : ""}`}
        >
            <ChevronUp size={24} strokeWidth={2.5} />
        </button>
    );
}
