import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ROUTE_REGISTRY } from "../../routes/metadata";
import { PATHS } from "../../routes/paths";

import styles from "./Navbar.module.css";

interface NavbarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const Navbar = ({ isOpen, setIsOpen }: NavbarProps) => {
    const location = useLocation();

    const renderNavLink = (path: string, meta: any) => {
        const Icon = meta.icon;
        const isActive =
            path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(path);

        return (
            <Link
                key={path}
                to={path}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
            >
                <span className={styles.icon}>
                    <Icon size={20} strokeWidth={2} />
                </span>
                <span className={styles.label}>{meta.label}</span>
            </Link>
        );
    };

    const navEntries = Object.entries(ROUTE_REGISTRY).filter(
        ([_, meta]) => meta.showInNav,
    );

    const mainLinks = navEntries.filter(([path]) => path !== PATHS.Settings);
    const settingsLink = navEntries.find(([path]) => path === PATHS.Settings);

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.expanded : ""}`}>
            <button
                className={styles.hamburger}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={styles.navLinks}>
                <div className={styles.topLinks}>
                    {mainLinks.map(([path, meta]) => renderNavLink(path, meta))}
                </div>

                {settingsLink && (
                    <div className={styles.bottomLinks}>
                        {renderNavLink(settingsLink[0], settingsLink[1])}
                    </div>
                )}
            </div>
        </aside>
    );
};
