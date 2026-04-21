import { Modal } from "../Modal";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => Promise<void>;
    title: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    textAreaValue?: string;
    textAreaOnChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function CreateModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    value,
    onChange,
    textAreaValue,
    textAreaOnChange,
}: Props) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`New ${title}`}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}
                className="ModalForm"
            >
                <input
                    autoFocus
                    value={value}
                    onChange={onChange}
                    className="ModalInput"
                />
                {(textAreaOnChange) && (
                    <textarea
                        value={textAreaValue}
                        onChange={textAreaOnChange}
                        placeholder="Paste code here..."
                        className="ModalTextarea"
                    />
                )}
                <button type="submit" className="ModalSubmitButton">
                    Create {title}
                </button>
            </form>
        </Modal>
    );
}
