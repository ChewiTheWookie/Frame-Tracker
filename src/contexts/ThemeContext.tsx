import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "system",
    setTheme: () => {},
    resolvedTheme: "dark",
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem("theme") as ThemeMode;
        return saved || "system";
    });

    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
        "dark",
    );

    useEffect(() => {
        const root = window.document.documentElement;
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const updateTheme = () => {
            let actualTheme: "light" | "dark";

            if (theme === "system") {
                actualTheme = mediaQuery.matches ? "dark" : "light";
            } else {
                actualTheme = theme;
            }

            root.classList.remove("light", "dark");
            root.classList.add(actualTheme);

            setResolvedTheme(actualTheme);
            localStorage.setItem("theme", theme);
        };

        updateTheme();

        const handleChange = () => {
            if (theme === "system") {
                updateTheme();
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
