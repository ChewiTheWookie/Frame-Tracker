import { Outlet, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import {
    ChevronRight,
    Info,
    Keyboard,
    Monitor,
    Moon,
    Palette,
    Sun,
} from "lucide-react";
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

    const sections = [
        {
            title: "Controls",
            icon: <Keyboard size={20} />,
            items: [
                {
                    label: "Keybinds",
                    desc: "Set Custom Keybinds",
                    onClick: () => navigate(PATHS.Keybinds),
                },
            ],
        },
        {
            title: "Appearance",
            icon: <Palette size={20} />,
            items: [
                {
                    label: "Theme Mode",
                    desc: `Currently: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`,
                    onClick: cycleTheme,
                    rightElement: THEME_ICONS[theme],
                },
            ],
        },
        {
            title: "About",
            icon: <Info size={20} />,
            items: [
                {
                    label: "Acknowledgements",
                    desc: "Open source licenses and credits",
                    onClick: () => navigate(PATHS.Acknowledgments),
                },
            ],
        },
    ];

    return (
        <>
            {sections.map((section) => (
                <section key={section.title} className={styles.section}>
                    <div className={styles.sectionHeader}>
                        {section.icon} <h2>{section.title}</h2>
                    </div>
                    {section.items.map((item) => (
                        <SettingItem key={item.label} {...item} />
                    ))}
                </section>
            ))}
            <Outlet />
        </>
    );
}

function SettingItem({ label, desc, onClick, rightElement }: any) {
    return (
        <button className={styles.settingButton} onClick={onClick}>
            <div className={styles.settingText}>
                <span className={styles.settingLabel}>{label}</span>
                <span className={styles.settingDesc}>{desc}</span>
            </div>
            {rightElement ? (
                <span className={styles.rightElement}>{rightElement}</span>
            ) : (
                <ChevronRight size={20} className={styles.chevron} />
            )}
        </button>
    );
}
