import React, { useEffect, useRef, useState } from "react";
import {
    Plus,
    User,
    X,
    Check,
    MoreVertical,
    Edit2,
    Trash2,
} from "lucide-react";
import { profileService } from "@/api/profiles";
import { Throbber } from "@/components/ui/Throbber";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { CardButton } from "@/components/ui/CardButton";

import styles from "./Profile.module.css";

export const Profile: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [profiles, setProfiles] = useState<string[]>([]);
    const [currentProfile, setCurrentProfile] = useState("Default");
    const [isLoading, setIsLoading] = useState(false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

    const [newProfileName, setNewProfileName] = useState("");
    const [targetProfile, setTargetProfile] = useState("");
    const [editName, setEditName] = useState("");

    useEffect(() => {
        let unlistenFn: (() => void) | undefined;
        const init = async () => {
            setIsLoading(true);
            await loadProfiles();
            try {
                const active = await profileService.getCurrent();
                setCurrentProfile(active);
            } catch (err) {
                console.error(err);
            }
            unlistenFn = await profileService.onSwitch((name) =>
                setCurrentProfile(name),
            );
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
            console.error(err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProfileName.trim()) return;
        await profileService.create(newProfileName.trim());
        setNewProfileName("");
        setIsCreateOpen(false);
        await loadProfiles();
    };

    const handleRename = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName.trim() || editName === targetProfile) {
            setIsEditOpen(false);
            return;
        }

        try {
            await profileService.rename(targetProfile, editName.trim());
            setIsEditOpen(false);
            await loadProfiles();
        } catch (err) {
            alert(err);
        }
    };

    const handleDelete = async () => {
        try {
            await profileService.delete(targetProfile);
            setIsDeleteOpen(false);
            await loadProfiles();
        } catch (err) {
            alert(err);
        }
    };

    return (
        <>
            <header className={styles.header}>
                <h2 className={styles.title}>Profiles</h2>
                <button
                    className={styles.openModalBtn}
                    onClick={() => setIsCreateOpen(true)}
                >
                    <Plus className={styles.addIcon} size={24} />
                </button>
            </header>

            <div
                className={styles.scrollContainer}
                ref={scrollRef}
                onClick={() => setMenuOpenFor(null)}
            >
                {isLoading && profiles.length === 0 ? (
                    <Throbber label="Loading profiles..." />
                ) : (
                    <div className={styles.list}>
                        {profiles.map((name) => (
                            <div key={name} className={styles.item}>
                                <span className={styles.itemName}>
                                    <User
                                        size={14}
                                        className={styles.userIcon}
                                    />
                                    {name}
                                </span>

                                <div className={styles.rightActions}>
                                    <span className={styles.activeButton}>
                                        <CardButton
                                            isActive={currentProfile === name}
                                            onClick={() =>
                                                profileService
                                                    .switch(name)
                                                    .then(() =>
                                                        window.location.reload(),
                                                    )
                                            }
                                            label="Switch"
                                            activeLabel={
                                                <>
                                                    <Check size={10} /> Active
                                                </>
                                            }
                                        />
                                    </span>

                                    <div className={styles.menuContainer}>
                                        <button
                                            className={styles.iconButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuOpenFor(
                                                    menuOpenFor === name
                                                        ? null
                                                        : name,
                                                );
                                            }}
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {menuOpenFor === name && (
                                            <div
                                                className={styles.dropdownMenu}
                                            >
                                                <button
                                                    onClick={() => {
                                                        setTargetProfile(name);
                                                        setEditName(name);
                                                        setIsEditOpen(true);
                                                    }}
                                                >
                                                    <Edit2 size={12} /> Rename
                                                </button>
                                                <button
                                                    className={
                                                        styles.deleteAction
                                                    }
                                                    disabled={
                                                        name === "Default" ||
                                                        name === currentProfile
                                                    }
                                                    onClick={() => {
                                                        setTargetProfile(name);
                                                        setIsDeleteOpen(true);
                                                    }}
                                                >
                                                    <Trash2 size={12} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <ScrollToTop targetRef={scrollRef} />
            </div>

            {isCreateOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setIsCreateOpen(false)}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>New Profile</h3>
                            <button
                                className={styles.closeButton}
                                onClick={() => setIsCreateOpen(false)}
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
                                    value={newProfileName}
                                    onChange={(e) =>
                                        setNewProfileName(e.target.value)
                                    }
                                    className={styles.modalInput}
                                    placeholder="Enter name..."
                                />
                            </div>
                            <button
                                type="submit"
                                className={styles.submitButton}
                            >
                                Create Profile
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isEditOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setIsEditOpen(false)}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>Rename "{targetProfile}"</h3>
                            <button
                                className={styles.closeButton}
                                onClick={() => setIsEditOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form
                            onSubmit={handleRename}
                            className={styles.modalForm}
                        >
                            <div className={styles.inputGroup}>
                                <label>New Name</label>
                                <input
                                    autoFocus
                                    value={editName}
                                    onChange={(e) =>
                                        setEditName(e.target.value)
                                    }
                                    className={styles.modalInput}
                                />
                            </div>
                            <button
                                type="submit"
                                className={styles.submitButton}
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setIsDeleteOpen(false)}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h3>Delete Profile</h3>
                            <button
                                className={styles.closeButton}
                                onClick={() => setIsDeleteOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p>
                            Are you sure you want to delete{" "}
                            <strong>{targetProfile}</strong>? This action cannot
                            be undone.
                        </p>
                        <div className={styles.modalForm}>
                            <button
                                onClick={handleDelete}
                                className={styles.submitButton}
                                style={{ background: "var(--error, #ef4444)" }}
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
