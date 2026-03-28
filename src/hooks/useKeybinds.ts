import { useEffect, useCallback } from "react";

type KeybindOptions = {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    preventDefault?: boolean;
};

export const useKeybind = (
    targetKey: string,
    callback: () => void,
    options: KeybindOptions = {},
) => {
    const {
        ctrl = false,
        shift = false,
        alt = false,
        meta = false,
        preventDefault = true,
    } = options;

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            const isInput =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable;

            const isSpecialKey =
                targetKey.toLowerCase() === "escape" || targetKey === "/";

            const hasModifier = event.ctrlKey || event.altKey || event.metaKey;

            if (isInput && !hasModifier && !isSpecialKey) {
                return;
            }

            const keyMatch =
                event.key.toLowerCase() === targetKey.toLowerCase();

            const modifierMatch =
                event.ctrlKey === ctrl &&
                event.shiftKey === shift &&
                event.altKey === alt &&
                event.metaKey === meta;

            if (keyMatch && modifierMatch) {
                if (preventDefault) {
                    event.preventDefault();
                }

                event.stopImmediatePropagation();

                callback();
            }
        },
        [targetKey, callback, ctrl, shift, alt, meta, preventDefault],
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown, { capture: true });

        return () => {
            window.removeEventListener("keydown", handleKeyDown, {
                capture: true,
            });
        };
    }, [handleKeyDown]);
};
