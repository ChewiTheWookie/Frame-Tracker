import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { ROUTE_METADATA } from "@/routes/metadata";

import styles from "./PopUpLayout.module.css";

export function PopUpLayout() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const metadata = ROUTE_METADATA[pathname];

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>{metadata.label}</h1>
                <button
                    className={styles.closeBtn}
                    onClick={() => navigate(-1)}
                >
                    <X size={20} className={styles.closeIcon} />
                </button>
            </header>
            <Outlet />
        </div>
    );
}
