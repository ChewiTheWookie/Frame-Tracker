import { useTheme } from "../../contexts/ThemeContext";

import styles from "./ThemeButton.module.css";

export function ThemeButton() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button className={styles.themeToggle} onClick={toggleTheme}>
            {theme === "dark" ? "LOTUS" : "OROKIN"}
        </button>
    );
}
