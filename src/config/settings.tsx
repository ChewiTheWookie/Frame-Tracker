import { Keyboard, Palette, Info, Sun, Moon, Monitor, Bug, Copy } from "lucide-react";
import { SettingSection } from "@/types/settings";
import { PATHS } from "@/routes/paths";
import { CardButton } from "@/components/ui/CardButton";
import { fetchAppLogs } from "@/api/logs";
import { error } from "@tauri-apps/plugin-log";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

import styles from "@/pages/Settings/Settings.module.css";

const THEME_ICONS = {
    light: <Sun size={18} />,
    dark: <Moon size={18} />,
    system: <Monitor size={18} />,
};

interface ConfigProps {
    navigate: (path: string) => void;
    theme: "light" | "dark" | "system";
    cycleTheme: () => void;
}

export const getSettingsConfig = ({
    navigate,
    theme,
    cycleTheme,
}: ConfigProps): SettingSection[] => [
        {
            title: "Controls",
            icon: <Keyboard size={20} className={styles.sectionIcon} />,
            items: [
                {
                    label: "Keybinds",
                    onClick: () => navigate(PATHS.Keybinds),
                },
            ],
        },
        {
            title: "Appearance",
            icon: <Palette size={20} className={styles.sectionIcon} />,
            items: [
                {
                    label: "Theme Mode",
                    onClick: cycleTheme,
                    rightElement: THEME_ICONS[theme],
                },
            ],
        },
        {
            title: "About",
            icon: <Info size={20} className={styles.sectionIcon} />,
            items: [
                {
                    label: "Acknowledgements",
                    onClick: () => navigate(PATHS.Acknowledgments),
                },
            ],
        },
        {
            title: "Debug",
            icon: <Bug size={20} className={styles.sectionIcon} />,
            items: [
                {
                    label: "Logs",
                    onClick: () => null,
                    rightElement: <CardButton
                        onClick={async () => {
                            try {
                                const logs = await fetchAppLogs();
                                await writeText(logs);
                                console.log("Logs copied to clipboard");
                            } catch (err) {
                                error(`Failed to copy logs: ${err}}`);
                            }
                        }}
                        label={<><Copy size={10} /> Copy</>}
                        width="5rem"
                        height="2rem"
                    />,
                },
            ],
        },
    ];
