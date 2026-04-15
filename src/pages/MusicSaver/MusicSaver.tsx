import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ListLayoutContext } from "@/layouts/ListLayout/ListLayout";
import { Copy, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import {
    useSavedSongStore,
    useSongNames,
    useSongDetail,
    useSongActions,
} from "@/stores/useSavedSongStore";
import { Throbber } from "@/components/ui/Throbber";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { CardButton } from "@/components/ui/CardButton";

import styles from "./MusicSaver.module.css";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export function MusicSaver() {
    const { setHeaderAction } = useOutletContext<ListLayoutContext>();
    const { fetchSongNames, addSong, renameSong, deleteSong } =
        useSongActions();
    const isLoading = useSavedSongStore((s) => s.isLoading);
    const songNames = useSongNames();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

    const [targetSong, setTargetSong] = useState("");
    const [newName, setNewName] = useState("");
    const [newString, setNewString] = useState("");
    const [editName, setEditName] = useState("");

    useEffect(() => {
        setHeaderAction(
            <button
                className={styles.openModalBtn}
                onClick={() => setIsAddOpen(true)}
            >
                <Plus size={24} className={styles.addIcon} />
            </button>,
        );
        return () => setHeaderAction(null);
    }, [setHeaderAction]);

    useEffect(() => {
        fetchSongNames();
    }, [fetchSongNames]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newString.trim()) return;
        await addSong(newName, newString);
        setNewName("");
        setNewString("");
        setIsAddOpen(false);
    };

    const handleRename = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editName.trim() || editName === targetSong) {
            setIsEditOpen(false);
            return;
        }
        await renameSong(targetSong, editName.trim());
        setIsEditOpen(false);
    };

    const handleDelete = async () => {
        await deleteSong(targetSong);
        setIsDeleteOpen(false);
    };

    return (
        <>
            {isLoading && songNames.length === 0 ? (
                <Throbber label="Loading..." />
            ) : (
                <div className={styles.list}>
                    {songNames.map((name) => (
                        <SongItem
                            key={name}
                            name={name}
                            isMenuOpen={menuOpenFor === name}
                            onMenuToggle={(e) => {
                                e.stopPropagation();
                                setMenuOpenFor(
                                    menuOpenFor === name ? null : name,
                                );
                            }}
                            onEditOpen={() => {
                                setTargetSong(name);
                                setEditName(name);
                                setIsEditOpen(true);
                            }}
                            onDeleteOpen={() => {
                                setTargetSong(name);
                                setIsDeleteOpen(true);
                            }}
                        />
                    ))}
                </div>
            )}

            <Modal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                title="Add New Song"
            >
                <form onSubmit={handleAdd} className={styles.modalForm}>
                    <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Song Title"
                        className={styles.modalInput}
                    />
                    <textarea
                        value={newString}
                        onChange={(e) => setNewString(e.target.value)}
                        placeholder="Paste code here..."
                        className={styles.modalTextarea}
                    />
                    <button type="submit" className={styles.submitButton}>
                        Save Song
                    </button>
                </form>
            </Modal>
            <Modal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title={`Rename ${targetSong}`}
            >
                <form onSubmit={handleRename} className={styles.modalForm}>
                    <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={styles.modalInput}
                    />
                    <button type="submit" className={styles.submitButton}>
                        Save Changes
                    </button>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Delete Profile"
                message={
                    <>
                        Are you sure you want to delete{" "}
                        <strong>{targetSong}</strong>?
                    </>
                }
            />
        </>
    );
}

interface SongItemProps {
    name: string;
    isMenuOpen: boolean;
    onMenuToggle: (e: React.MouseEvent) => void;
    onEditOpen: () => void;
    onDeleteOpen: () => void;
}

function SongItem({
    name,
    isMenuOpen,
    onMenuToggle,
    onEditOpen,
    onDeleteOpen,
}: SongItemProps) {
    const { fetchSongDetails } = useSongActions();
    const songString = useSongDetail(name);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!songString) await fetchSongDetails(name);
        const currentString = useSavedSongStore.getState().songCache[name];
        if (currentString) {
            await writeText(currentString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className={styles.item}>
            <span className={styles.itemName}>{name}</span>

            <div className={styles.rightActions}>
                <span className={styles.activeButton}>
                    <CardButton
                        isActive={copied}
                        onClick={handleCopy}
                        label={
                            <>
                                <Copy size={10} /> Copy
                            </>
                        }
                        activeLabel="Copied"
                    />
                </span>

                <div className={styles.menuContainer}>
                    <button
                        className={styles.iconButton}
                        onClick={onMenuToggle}
                    >
                        <MoreVertical size={16} />
                    </button>

                    {isMenuOpen && (
                        <div className={styles.dropdownMenu}>
                            <button onClick={onEditOpen}>
                                <Edit2 size={12} /> Rename
                            </button>
                            <button
                                className={styles.deleteAction}
                                onClick={onDeleteOpen}
                            >
                                <Trash2 size={12} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
