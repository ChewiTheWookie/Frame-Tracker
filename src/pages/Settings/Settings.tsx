import { useNavigate } from "react-router-dom";
import { Palette, Info, ChevronRight, Moon, Sun, Monitor } from "lucide-react";
import { ThemeMode, useTheme } from "../../contexts/ThemeContext";
import { PATHS } from "../../routes/paths";
import { ScrollToTop } from "../../components/ScrollToTop";

import styles from "./Settings.module.css";

export const Settings = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const cycleTheme = () => {
        const modes: ThemeMode[] = ["light", "dark", "system"];
        const nextIndex = (modes.indexOf(theme) + 1) % modes.length;
        setTheme(modes[nextIndex]);
    };

    return (
        <main className={styles.container}>
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Palette size={20} />
                    <h2>Appearance</h2>
                </div>
                <div className={styles.card}>
                    <button
                        className={styles.settingButton}
                        onClick={cycleTheme}
                    >
                        <div className={styles.labelGroup}>
                            <p className={styles.settingLabel}>Theme Mode</p>
                            <p className={styles.settingDesc}>
                                Currently using {theme} mode
                            </p>
                        </div>
                        <div className={styles.themeToggleIcon}>
                            {theme === "light" && <Sun size={20} />}
                            {theme === "dark" && <Moon size={20} />}
                            {theme === "system" && <Monitor size={20} />}
                        </div>
                    </button>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Info size={20} />
                    <h2>About</h2>
                </div>
                <div className={styles.card}>
                    <button
                        className={styles.navButton}
                        onClick={() => navigate(PATHS.Acknowledgments)}
                    >
                        <div className={styles.labelGroup}>
                            <p className={styles.settingLabel}>
                                Acknowledgments:
                            </p>
                            <p className={styles.settingDesc}>
                                Open source licenses and credits
                            </p>
                        </div>
                        <ChevronRight size={20} className={styles.chevron} />
                    </button>
                </div>
            </section>
            <ScrollToTop />
        </main>
    );
};
