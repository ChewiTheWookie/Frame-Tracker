import { Outlet, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ChevronRight, Info, Monitor, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

import styles from "./Settings.module.css";

const THEME_ICONS = {
    light: <Sun size={18} />,
    dark: <Moon size={18} />,
    system: <Monitor size={18} />,
};

export function Settings() {
    const navigate = useNavigate();
    const { theme, cycleTheme } = useTheme();

    return (
        <main className={styles.main}>
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <Palette size={20} /> <h2>Appearance</h2>
                </div>
                <button className={styles.settingButton} onClick={cycleTheme}>
                    <div className={styles.settingText}>
                        <span className={styles.settingLabel}>Theme Mode</span>
                        <span className={styles.settingDesc}>
                            Currently:{" "}
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </span>
                    </div>
                    <span className={styles.themeIcon}>
                        {THEME_ICONS[theme]}
                    </span>
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
                    <div className={styles.settingText}>
                        <span className={styles.settingLabel}>
                            Acknowledgements
                        </span>
                        <span className={styles.settingDesc}>
                            Open source licenses and credits
                        </span>
                    </div>
                    <ChevronRight size={20} className={styles.chevron} />
                </button>
            </section>
            <Outlet />
        </main>
    );
}
