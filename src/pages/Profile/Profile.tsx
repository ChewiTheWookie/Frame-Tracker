import React, { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { error } from "@tauri-apps/plugin-log";
import { PATHS } from "@/routes/paths";
import { ListLayoutContext } from "@/layouts/ListLayout/ListLayout";
import { Plus, User, Check, Edit2, Trash2 } from "lucide-react";
import {
    useProfileStore,
    useProfiles,
    useCurrentProfile,
    useProfileActions
} from "@/stores/useProfileStore";

import { Throbber } from "@/components/ui/Throbber";
import { CardButton } from "@/components/ui/CardButton";
import { Modal, DeleteModal, RenameModal } from "@/components/ui/Modal";
import { ListItem } from "@/components/ui/ListItem";

import styles from "./Profile.module.css";

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { setHeaderAction } = useOutletContext<ListLayoutContext>();

    const profiles = useProfiles();
    const currentProfile = useCurrentProfile();
    const isLoading = useProfileStore((s) => s.isLoading);
    const {
        refresh,
        switchProfile,
        createProfile,
        renameProfile,
        deleteProfile,
        initializeListener
    } = useProfileActions();

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
        let unlisten: (() => void) | undefined;

        const setup = async () => {
            await refresh();
            unlisten = await initializeListener();
        };

        setup();

        return () => {
            if (unlisten) unlisten();
        };
    }, [refresh, initializeListener]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProfileName.trim()) return;

        try {
            await createProfile(newProfileName.trim());
            setNewProfileName("");
            setIsCreateOpen(false);
        } catch (err) {
            error(`Failed to create Profile: ${err}`);
        }
    };

    const handleRename = async () => {
        if (!editName.trim() || editName === targetProfile) {
            setIsEditOpen(false);
            return;
        }

        try {
            await renameProfile(targetProfile, editName.trim());
            setIsEditOpen(false);
        } catch (err) {
            alert(err);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteProfile(targetProfile);
            setIsDeleteOpen(false);
        } catch (err) {
            alert(err);
        }
    };

    const handleSwitch = async (name: string) => {
        try {
            await switchProfile(name);
            navigate(PATHS.Mastery);
        } catch (err) {
            error(`Failed to switch profile: ${err}`);
        }
    };

    return (
        <>
            {isLoading && profiles.length === 0 ? (
                <Throbber label="Loading profiles..." />
            ) : (
                <div>
                    {profiles.map((name) => (
                        <ListItem
                            key={name}
                            icon={<User size={14} className={styles.userIcon} />}
                            title={name}
                            button={
                                <CardButton
                                    isActive={currentProfile === name}
                                    onClick={() => handleSwitch(name)}
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
                                <>
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
                                        className="ModalDeleteAction"
                                        disabled={name === "Default" || name === currentProfile}
                                        onClick={() => {
                                            setTargetProfile(name);
                                            setIsDeleteOpen(true);
                                        }}
                                    >
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </>
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
                    <input
                        autoFocus
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        className="ModalInput"
                        placeholder="Enter name..."
                    />
                    <button type="submit" className="ModalSubmitButton">
                        Create Profile
                    </button>
                </form>
            </Modal>

            <RenameModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSubmit={handleRename}
                title="Profile"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
            />

            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Profile"
                toDelete={targetProfile}
            />
        </>
    );
};