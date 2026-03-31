import { useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";

import styles from "./ScrollToTop.module.css";

interface Props {
    targetRef: React.RefObject<HTMLElement | null>;
    threshold?: number;
}

export function ScrollToTop({ targetRef, threshold = 200 }: Props) {
    const [isVisible, setIsVisible] = useState(false);

    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const scrollContainer = targetRef.current;

        if (!scrollContainer) return;

        const handleScroll = () => {
            const shouldBeVisible = scrollContainer.scrollTop > threshold;
            setIsVisible((prev) =>
                prev !== shouldBeVisible ? shouldBeVisible : prev,
            );
        };

        scrollContainer.addEventListener("scroll", handleScroll);

        handleScroll();

        return () =>
            scrollContainer.removeEventListener("scroll", handleScroll);
    }, [targetRef, threshold]);

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
