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

            const isModifierPressed =
                event.ctrlKey || event.altKey || event.metaKey;

            const isSpecialKey = targetKey === "Escape" || targetKey === "/";

            if (isInput && !isModifierPressed && !isSpecialKey) {
                return;
            }

            const match =
                event.key.toLowerCase() === targetKey.toLowerCase() &&
                event.ctrlKey === ctrl &&
                event.shiftKey === shift &&
                event.altKey === alt &&
                event.metaKey === meta;

            if (match) {
                event.stopImmediatePropagation();

                if (preventDefault) {
                    event.preventDefault();
                }

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
