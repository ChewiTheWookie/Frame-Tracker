import { Outlet, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { getSettingsConfig } from "@/config/settings";
import { ListItem } from "@/components/ui/ListItem";

import styles from "./Settings.module.css";

export function Settings() {
    const navigate = useNavigate();
    const { theme, cycleTheme } = useTheme();

    const sections = getSettingsConfig({ navigate, theme, cycleTheme });

    return (
        <>
            {sections.map((section) => (
                <section key={section.title} className={styles.section}>
                    <div className={styles.sectionHeader}>
                        {section.icon} <h2>{section.title}</h2>
                    </div>
                    {section.items.map((item) => (
                        <ListItem
                            key={item.label}
                            title={item.label}
                            onClick={item.onClick}
                            button={
                                item.rightElement ? (
                                    <span className={styles.rightElement}>
                                        {item.rightElement}
                                    </span>
                                ) : (
                                    <ChevronRight
                                        size={20}
                                        className={styles.chevron}
                                    />
                                )
                            }
                        />
                    ))}
                </section>
            ))}
            <Outlet />
        </>
    );
}
