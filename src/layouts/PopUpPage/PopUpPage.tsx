import React from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

import styles from "./PopUpPage.module.css";

interface Props {
    label: string;
    content: React.ReactNode;
}

export function PopUpPage({ label, content }: Props) {
    const navigate = useNavigate();

    return (
        <div className={styles.pageContainer}>
            <header>
                <h1 className={styles.title}>{label}</h1>
                <button
                    className={styles.closeBtn}
                    onClick={() => navigate(-1)}
                >
                    <X size={20} className={styles.closeIcon} />
                </button>
            </header>
            {content}
        </div>
    );
}
