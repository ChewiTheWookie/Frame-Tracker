import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ListLayoutContext } from "@/layouts/ListLayout/ListLayout";
import { Copy, Plus, Edit2, Trash2 } from "lucide-react";
import {
    useSavedSongStore,
    useSongNames,
    useSongActions,
} from "@/stores/useSavedSongStore";
import { Throbber } from "@/components/ui/Throbber";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { CardButton } from "@/components/ui/CardButton";
import { Modal, DeleteModal, RenameModal } from "@/components/ui/Modal";
import { ListItem } from "@/components/ui/ListItem";
import { ScrollSentinel } from "@/components/shared/ScrollSentinel";

export function MusicSaver() {
    const { setHeaderAction, scrollRef } = useOutletContext<ListLayoutContext>();
    const {
        fetchData,
        loadMore,
        addSong,
        fetchSongDetails,
        renameSong,
        deleteSong,
    } = useSongActions();

    const isLoading = useSavedSongStore((s) => s.isLoading);
    const hasMore = useSavedSongStore((s) => s.hasMore);
    const songNames = useSongNames();

    const songCache = useSavedSongStore((s: any) => s.songCache);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [targetSong, setTargetSong] = useState("");
    const [newName, setNewName] = useState("");
    const [newString, setNewString] = useState("");
    const [editName, setEditName] = useState("");
    const [copiedSong, setCopiedSong] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setHeaderAction(
            <button className="layoutListHeaderAction" onClick={() => setIsAddOpen(true)}>
                <Plus size={24} className="layoutListHeaderIcon" />
            </button>,
        );
        return () => setHeaderAction(null);
    }, [setHeaderAction]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newString.trim()) return;
        await addSong(newName, newString);
        setNewName("");
        setNewString("");
        setIsAddOpen(false);
    };

    const handleCopy = async (name: string) => {
        let songData = songCache[name];
        if (!songData) {
            await fetchSongDetails(name);
            songData = useSavedSongStore.getState().songCache[name];
        }

        if (songData) {
            await writeText(songData);
            setCopiedSong(name);
            setTimeout(() => setCopiedSong(null), 2000);
        }
    };

    const handleRename = async () => {
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
                <>
                    {songNames.map((name) => (
                        <ListItem
                            key={name}
                            title={name}
                            button={
                                <CardButton
                                    isActive={copiedSong === name}
                                    onClick={() => handleCopy(name)}
                                    label={<><Copy size={10} /> Copy</>}
                                    activeLabel="Copied"
                                    width="5rem"
                                    height="2rem"
                                />
                            }
                            dropdown={
                                <>
                                    <button onClick={() => {
                                        setTargetSong(name);
                                        setEditName(name);
                                        setIsEditOpen(true);
                                    }}>
                                        <Edit2 size={12} /> Rename
                                    </button>
                                    <button className="ModalDeleteAction" onClick={() => {
                                        setTargetSong(name);
                                        setIsDeleteOpen(true);
                                    }}>
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </>
                            }
                        />
                    ))}

                    <ScrollSentinel
                        isLoading={isLoading}
                        hasMore={hasMore}
                        loadMore={loadMore}
                        targetRef={scrollRef}
                    />
                </>
            )}

            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Song">
                <form onSubmit={handleAdd} className="ModalForm">
                    <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Song Title" className="ModalInput" />
                    <textarea value={newString} onChange={(e) => setNewString(e.target.value)} placeholder="Paste code here..." className="ModalTextarea" />
                    <button type="submit" className="ModalSubmitButton">Save Song</button>
                </form>
            </Modal>

            <RenameModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSubmit={handleRename}
                title={"Song"}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
            />

            <DeleteModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title="Song" toDelete={targetSong} />
        </>
    );
}