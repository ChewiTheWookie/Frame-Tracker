import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ROUTE_REGISTRY } from "../../routes/metadata";

import styles from "./Navbar.module.css";

interface NavbarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const Navbar = ({ isOpen, setIsOpen }: NavbarProps) => {
    const location = useLocation();

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.expanded : ""}`}>
            <button
                className={styles.hamburger}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={styles.navLinks}>
                {Object.entries(ROUTE_REGISTRY)
                    .filter(([_, meta]) => meta.showInNav)
                    .map(([path, meta]) => {
                        const Icon = meta.icon;
                        const isActive = location.pathname === path;

                        return (
                            <Link
                                key={path}
                                to={path}
                                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                            >
                                <span className={styles.icon}>
                                    <Icon size={20} strokeWidth={2} />
                                </span>

                                <span className={styles.label}>
                                    {meta.label}
                                </span>
                            </Link>
                        );
                    })}
            </div>
        </aside>
    );
};
