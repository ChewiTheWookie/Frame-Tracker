import { Link, useLocation } from "react-router-dom";
import { ROUTE_REGISTRY } from "../../routes/metadata";

import styles from "./Navbar.module.css";

interface NavbarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const Navbar = ({ isOpen, setIsOpen }: NavbarProps) => {
    const location = useLocation();

    return (
        <nav
            className={`${styles.navDropdown} ${isOpen ? styles.show : ""}`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <div className={styles.navLinks}>
                {Object.entries(ROUTE_REGISTRY)
                    .filter(([_, meta]) => meta.showInNav)
                    .map(([path, meta]) => (
                        <Link
                            key={path}
                            to={path}
                            className={`${styles.navLink} ${location.pathname === path ? styles.active : ""}`}
                            onClick={() => setIsOpen(false)}
                        >
                            {meta.label}
                        </Link>
                    ))}
            </div>
        </nav>
    );
};
