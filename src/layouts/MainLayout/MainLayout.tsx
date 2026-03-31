import { Outlet } from "react-router-dom";
import { Navbar } from "../Navbar";

import styles from "./MainLayout.module.css";

export function MainLayout() {
    return (
        <>
            <Navbar />
            <main className={styles.mainContainer}>
                <Outlet />
            </main>
        </>
    );
}
