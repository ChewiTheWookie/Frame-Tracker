import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ROUTE_METADATA } from "@/routes/metadata";
import { PATHS } from "@/routes/paths";

import styles from "./Navbar.module.css";
import { useKeybind } from "@/hooks/useKeybinds";

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
    const handleTab = () => {
        if (cyclePaths.length <= 1) return;

        const currentIndex = cyclePaths.indexOf(location.pathname);
        const nextIndex = (currentIndex + 1) % cyclePaths.length;

        navigate(cyclePaths[nextIndex]);
    };

    useKeybind("Tab", handleTab);

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
