import { useEffect, useState } from "react";
import { useRoutes } from "react-router-dom";
import { ROUTES } from "./routes/routes";
import { useTimeStore } from "./store/useTimeStore";
import { useKeybind } from "./hooks/useKeybinds";
import { ThemeButton } from "./components/ThemeButton";
import { Navbar } from "./components/Navbar";
import { SearchControls } from "./components/SearchControls";

import styles from "./styles/App.module.css";

export function App() {
    const updateTime = useTimeStore((state) => state.updateTime);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useKeybind();

    useEffect(() => {
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, [updateTime]);

    return (
        <div className={styles.appContainer}>
            <Navbar isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />

            <div className={styles.topSection}>
                <header className={styles.header}>
                    <div
                        className={styles.titleContainer}
                        onMouseEnter={() => setIsMenuOpen(true)}
                        onMouseLeave={() => setIsMenuOpen(false)}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <h1 className={styles.title}>Frame Tracker</h1>
                    </div>
                    <ThemeButton />
                </header>
                <nav>
                    <SearchControls />
                </nav>
            </div>

            <main>{useRoutes(ROUTES)}</main>
        </div>
    );
}
