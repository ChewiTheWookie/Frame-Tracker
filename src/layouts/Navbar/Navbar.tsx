import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ROUTE_METADATA } from "@/routes/metadata";
import { PATHS } from "@/routes/paths";

import styles from "./Navbar.module.css";

export function Navbar() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const navEntries = Object.entries(ROUTE_METADATA).filter(
        ([_, meta]) => meta.showInNav,
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
