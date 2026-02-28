import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../routes/Routes";

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
                {ROUTES.map((route) => (
                    <Link
                        key={route.key}
                        to={route.path}
                        className={`${styles.navLink} ${
                            location.pathname === route.path
                                ? styles.active
                                : ""
                        }`}
                        onClick={() => setIsOpen(false)}
                    >
                        {route.name}
                    </Link>
                ))}
            </div>
        </nav>
    );
};
