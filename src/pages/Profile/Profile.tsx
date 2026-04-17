import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { ListLayoutContext } from "@/layouts/ListLayout/ListLayout";
import { Plus, User, Check, Edit2, Trash2 } from "lucide-react";
import { profileService } from "@/api/profiles";
import { Throbber } from "@/components/ui/Throbber";
import { CardButton } from "@/components/ui/CardButton";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ListItem } from "@/components/ui/ListItem";

import styles from "./Profile.module.css";

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { setHeaderAction } = useOutletContext<ListLayoutContext>();

    const [profiles, setProfiles] = useState<string[]>([]);
    const [currentProfile, setCurrentProfile] = useState("Default");
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [newProfileName, setNewProfileName] = useState("");
    const [targetProfile, setTargetProfile] = useState("");
    const [editName, setEditName] = useState("");

    useEffect(() => {
        setHeaderAction(
            <button
                className="layoutListHeaderAction"
                onClick={() => setIsCreateOpen(true)}
            >
                <Plus size={24} className="layoutListHeaderIcon" />
            </button>,
        );
        return () => setHeaderAction(null);
    }, [setHeaderAction]);

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
            {isLoading && profiles.length === 0 ? (
                <Throbber label="Loading profiles..." />
            ) : (
                <div className={styles.list}>
                    {profiles.map((name) => (
                        <ListItem
                            key={name}
                            icon={
                                <User size={14} className={styles.userIcon} />
                            }
                            title={name}
                            button={
                                <CardButton
                                    isActive={currentProfile === name}
                                    onClick={async () => {
                                        try {
                                            await profileService.switch(name);
                                            navigate(PATHS.Mastery);
                                        } catch (err) {
                                            console.error(
                                                "Failed to switch profile:",
                                                err,
                                            );
                                        }
                                    }}
                                    label="Switch"
                                    activeLabel={
                                        <>
                                            <Check size={10} /> Active
                                        </>
                                    }
                                    width="5rem"
                                    height="2rem"
                                />
                            }
                            dropdown={
                                <div className="ListItemDropdown">
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
                                        className={styles.deleteAction}
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
                            }
                        />
                    ))}
                </div>
            )}

            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="New Profile"
            >
                <form onSubmit={handleCreate} className="ModalForm">
                    <div className={styles.inputGroup}>
                        <label>Profile Name</label>
                        <input
                            autoFocus
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            className="ModalInput"
                            placeholder="Enter name..."
                        />
                    </div>
                    <button type="submit" className="ModalSubmitButton">
                        Create Profile
                    </button>
                </form>
            </Modal>

            <Modal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title="Rename Profile"
            >
                <form onSubmit={handleRename} className="ModalForm">
                    <div className={styles.inputGroup}>
                        <label>New Name</label>
                        <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="ModalInput"
                        />
                    </div>
                    <button type="submit" className="ModalSubmitButton">
                        Save Changes
                    </button>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Profile"
                toDelete={targetProfile}
            />
        </>
    );
};
