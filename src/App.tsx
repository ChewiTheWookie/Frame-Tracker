import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ROUTES } from "./routes/Routes";
import { MASTERY_CATEGORIES } from "./types/inventory";
import { useInventoryStore } from "./store/useInventoryStore";
import { ThemeButton } from "./components/ThemeButton";
import { Navbar } from "./components/Navbar";
import { CategoryTabs } from "./components/CategoryTabs";
import { SearchControls } from "./components/SearchControls";

import styles from "./styles/App.module.css";

export function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const activeMasteryCat = useInventoryStore((state) => state.activeCategory);
    const setActiveMasteryCat = useInventoryStore(
        (state) => state.setActiveCategory,
    );

    const renderCategoryTabs = () => {
        switch (location.pathname) {
            case "/":
                return (
                    <>
                        <CategoryTabs
                            categories={MASTERY_CATEGORIES}
                            activeCategory={activeMasteryCat}
                            onCategoryChange={setActiveMasteryCat}
                        />
                        <SearchControls />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`${styles.appContainer} `}>
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
                <nav>{renderCategoryTabs()}</nav>
            </div>

            <main>
                <Routes>
                    {ROUTES.map((route) => (
                        <Route
                            path={route.path}
                            element={route.element}
                            key={route.key}
                        />
                    ))}
                </Routes>
            </main>
        </div>
    );
}
