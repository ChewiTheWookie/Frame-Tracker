import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ROUTE_METADATA } from "@/routes/metadata";
import { PATHS } from "@/routes/paths";
import { useActionKeybind } from "@/hooks/useKeybinds";

import styles from "./Navbar.module.css";

export function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const navEntries = Object.entries(ROUTE_METADATA).filter(
        ([_, meta]) => meta.showInNav,
    );

    const cyclePaths = Object.entries(ROUTE_METADATA)
        .filter(([_, meta]) => meta.showInNav && meta.isCycleTarget)
        .map(([path]) => path);
    const handlePageCycle = () => {
        if (cyclePaths.length <= 1) return;

        const currentIndex = cyclePaths.indexOf(location.pathname);
        const nextIndex = (currentIndex + 1) % cyclePaths.length;

        navigate(cyclePaths[nextIndex]);
    };

    const handlePageBackCycle = () => {
        const currentIndex = cyclePaths.indexOf(location.pathname);
        const prevIndex =
            currentIndex <= 0 ? cyclePaths.length - 1 : currentIndex - 1;

        navigate(cyclePaths[prevIndex]);
    };

    const handlePageNavigation = (path: (typeof PATHS)[keyof typeof PATHS]) => {
        navigate(path);
    };

    useActionKeybind("CYCLE_PAGE", handlePageCycle);
    useActionKeybind("BACK_CYCLE_PAGE", handlePageBackCycle);
    useActionKeybind("MASTERY_PAGE", () => handlePageNavigation(PATHS.Mastery));
    useActionKeybind("TASK_PAGE", () => handlePageNavigation(PATHS.Tasks));
    useActionKeybind("MUSIC_PAGE", () => handlePageNavigation(PATHS.Music));
    useActionKeybind("PROFILE_PAGE", () => handlePageNavigation(PATHS.Profile));
    useActionKeybind("SETTINGS_PAGE", () =>
        handlePageNavigation(PATHS.Settings),
    );

    const renderNavLink = (path: string, meta: any) => {
        const Icon = meta.icon;
        const isActive =
            path === "/"
                ? location.pathname === "/"
                : location.pathname === path;

        return (
            <Link
                key={path}
                to={path}
                className={`${styles.navLink} ${isActive ? styles.active : ""} ${path === PATHS.Profile ? styles.bottomNav : ""}`}
            >
                <Icon size={20} className={styles.icon} />
                <span className={styles.label}>{meta.label}</span>
            </Link>
        );
    };

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.expanded : ""}`}>
            <button
                className={styles.hamburger}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <nav className={styles.navLinks}>
                {navEntries.map(([path, meta]) => renderNavLink(path, meta))}
            </nav>
        </aside>
    );
}
