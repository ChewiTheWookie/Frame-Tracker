import { Modal } from "@/components/ui/Modal";

import styles from "./ConfirmModal.module.css";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    toDelete: React.ReactNode;
    confirmLabel?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    toDelete: message,
    confirmLabel = "Delete Permanently",
}) => (
    <Modal isOpen={isOpen} onClose={onClose} title={`Delete ${title}`}>
        <p>
            Are you sure you want to delete <strong>{message}</strong>?
        </p>
        <button onClick={onConfirm} className={styles.submitButton}>
            {confirmLabel}
        </button>
    </Modal>
);
