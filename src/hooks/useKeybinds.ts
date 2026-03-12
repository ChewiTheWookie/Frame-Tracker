import { useEffect } from "react";

export const useKeybind = () => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key === "f")) {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("focus-search"));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
};
