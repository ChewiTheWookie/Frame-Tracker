import { useEffect, useRef, useState } from "react";
import { Copy, Plus, X } from "lucide-react";
import {
    useSavedSongStore,
    useSongNames,
    useSongDetail,
    useSongActions,
} from "@/stores/useSavedSongStore";
import { Throbber } from "@/components/ui/Throbber";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

import styles from "./MusicSaver.module.css";
import { CardButton } from "@/components/ui/CardButton";

export function MusicSaver() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { fetchSongNames, addSong } = useSongActions();
    const isLoading = useSavedSongStore((s) => s.isLoading);
    const songNames = useSongNames();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newString, setNewString] = useState("");

    useEffect(() => {
        fetchSongNames();
    }, [fetchSongNames]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newString.trim()) return;

        await addSong(newName, newString);
        setNewName("");
        setNewString("");
        setIsModalOpen(false);
    };

    return (
        <>
            <header className={styles.header}>
                <h2 className={styles.title}>Songs</h2>
                <button
                    className={styles.openModalBtn}
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className={styles.addIcon} size={24} />
                </button>
            </header>

            <div className={styles.scrollContainer} ref={scrollRef}>
                {isLoading && songNames.length === 0 ? (
                    <Throbber label="Loading..." />
                ) : (
                    <div className={styles.list}>
                        {songNames.map((name) => (
                            <SongItem key={name} name={name} />
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
                            <h3>Add New Song</h3>
                            <button
                                className={styles.closeButton}
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAdd} className={styles.modalForm}>
                            <div className={styles.inputGroup}>
                                <label>Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Song Title"
                                    className={styles.modalInput}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Song String</label>
                                <textarea
                                    value={newString}
                                    onChange={(e) =>
                                        setNewString(e.target.value)
                                    }
                                    placeholder="Paste code here..."
                                    className={styles.modalTextarea}
                                />
                            </div>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isLoading}
                            >
                                {isLoading ? <Throbber /> : "Save Song"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

function SongItem({ name }: { name: string }) {
    const { fetchSongDetails } = useSongActions();
    const songString = useSongDetail(name);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            if (!songString) {
                await fetchSongDetails(name);
            }

            const currentString = useSavedSongStore.getState().songCache[name];

            if (currentString) {
                await writeText(currentString);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <div className={styles.item}>
            <span className={styles.itemName}>{name}</span>

            <span className={styles.copyButton}>
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
        </div>
    );
}
