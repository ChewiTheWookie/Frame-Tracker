import { Modal } from "@/components/ui/Modal";

import styles from "./ConfirmModal.module.css";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmLabel?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Delete Permanently",
}) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <p>{message}</p>
        <button onClick={onConfirm} className={styles.submitButton}>
            {confirmLabel}
        </button>
    </Modal>
);
