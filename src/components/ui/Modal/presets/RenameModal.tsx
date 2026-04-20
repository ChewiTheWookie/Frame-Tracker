import { Modal } from "../Modal";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => Promise<void>;
    title: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function RenameModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    value,
    onChange,
}: Props) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Rename ${title}`}
        >
            <form onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }} className="ModalForm">
                <input
                    autoFocus
                    value={value}
                    onChange={onChange}
                    className="ModalInput"
                />
                <button type="submit" className="ModalSubmitButton">
                    Save Changes
                </button>
            </form>
        </Modal>
    );
}