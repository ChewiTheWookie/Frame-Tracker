import React, { useEffect, useRef, useState } from "react";
import { Plus, User, X, Check } from "lucide-react";
import { profileService } from "@/api/profiles";
import { Throbber } from "@/components/ui/Throbber";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { CardButton } from "@/components/ui/CardButton";

import styles from "./Profile.module.css";

export const Profile: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [profiles, setProfiles] = useState<string[]>([]);
    const [newProfileName, setNewProfileName] = useState("");
    const [currentProfile, setCurrentProfile] = useState("Default");
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        let unlistenFn: (() => void) | undefined;

        const init = async () => {
            setIsLoading(true);
            await loadProfiles();

            try {
                const active = await profileService.getCurrent();
                setCurrentProfile(active);
            } catch (err) {
                console.error("Failed to get active profile:", err);
            }

            unlistenFn = await profileService.onSwitch((name) => {
                setCurrentProfile(name);
            });
            setIsLoading(false);
        };

        init();

        return () => {
            if (unlistenFn) unlistenFn();
        };
    }, []);

    const loadProfiles = async () => {
        try {
            const list = await profileService.list();
            setProfiles(list);
        } catch (err) {
            console.error("Failed to load profiles:", err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProfileName.trim()) return;

        setIsLoading(true);
        try {
            await profileService.create(newProfileName.trim());
            setNewProfileName("");
            setIsModalOpen(false);
            await loadProfiles();
        } catch (err) {
            alert(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwitch = async (name: string) => {
        if (name === currentProfile) return;
        try {
            await profileService.switch(name);
            setCurrentProfile(name);
            window.location.reload();
        } catch (err) {
            console.error("Switch failed:", err);
        }
    };

    return (
        <>
            <header className={styles.header}>
                <h2 className={styles.title}>Profiles</h2>
                <button
                    className={styles.openModalBtn}
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className={styles.addIcon} size={24} />
                </button>
            </header>

            <div className={styles.scrollContainer} ref={scrollRef}>
                {isLoading && profiles.length === 0 ? (
                    <Throbber label="Loading profiles..." />
                ) : (
                    <div className={styles.list}>
                        {profiles.map((name) => (
                            <div key={name} className={styles.item}>
                                <span className={styles.itemName}>
                                    <User
                                        size={14}
                                        style={{
                                            marginRight: "8px",
                                            opacity: 0.6,
                                        }}
                                    />
                                    {name}
                                </span>

                                <span className={styles.copyButton}>
                                    <CardButton
                                        isActive={currentProfile === name}
                                        onClick={() => handleSwitch(name)}
                                        label="Switch"
                                        activeLabel={
                                            <>
                                                <Check size={10} /> Active
                                            </>
                                        }
                                    />
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                <ScrollToTop targetRef={scrollRef} />
            </div>

            {isModalOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>Create New Profile</h3>
                            <button
                                className={styles.closeButton}
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreate}
                            className={styles.modalForm}
                        >
                            <div className={styles.inputGroup}>
                                <label>Profile Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newProfileName}
                                    onChange={(e) =>
                                        setNewProfileName(e.target.value)
                                    }
                                    placeholder="Enter name (e.g. Player2)"
                                    className={styles.modalInput}
                                />
                            </div>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isLoading || !newProfileName.trim()}
                            >
                                {isLoading ? <Throbber /> : "Create Profile"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
