import { useNavigate } from "react-router-dom";
import { PATHS } from "../../routes/paths";
import { ChevronRight, Info, Monitor, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

import styles from "./Settings.module.css";

export function Settings() {
    const navigate = useNavigate();
    const { theme, cycleTheme } = useTheme();

    const getThemeIcon = () => {
        switch (theme) {
            case "light":
                return <Sun size={18} />;
            case "dark":
                return <Moon size={18} />;
            case "system":
                return <Monitor size={18} />;
        }
    };

    return (
        <main className={styles.main}>
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Palette size={20} /> <h2>Appearance</h2>
                </div>
                <button className={styles.settingButton} onClick={cycleTheme}>
                    <span className={styles.settingLabel}>Theme Mode:</span>
                    <span className={styles.settingDesc}>
                        Currently using{" "}
                        {theme.charAt(0).toUpperCase() + theme.slice(1)} mode
                    </span>
                    <span className={styles.themeIcon}>{getThemeIcon()}</span>
                </button>
            </section>
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Info size={20} /> <h2>About</h2>
                </div>
                <button
                    className={styles.settingButton}
                    onClick={() => navigate(PATHS.Acknowledgments)}
                >
                    <span className={styles.settingLabel}>
                        Acknowledgements:
                    </span>
                    <span className={styles.settingDesc}>
                        Open source licenses and credits
                    </span>
                    <span className={styles.chevron}>
                        <ChevronRight size={20} />
                    </span>
                </button>
            </section>
        </main>
    );
}
