import { Modal } from "@/components/ui/Modal";
import { useTaskStore } from "@/stores/useTaskStore";

import styles from "./TaskResetModal.module.css";

export function TaskResetModal() {
    const { isOpen, taskNames } = useTaskStore((s) => s.resetModal);
    const { setResetModal } = useTaskStore((s) => s.actions);

    const handleClose = () => setResetModal(false);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Tasks Reset"
        >
            <>
                <p className={styles.p}>
                    The following tasks have reset:
                </p>
                <ul className={styles.ul}>
                    {taskNames.map((name) => (
                        <li
                            key={name}
                            className={styles.li}
                        >
                            {name}
                        </li>
                    ))}
                </ul>
                <button
                    onClick={handleClose}
                    className="ModalSubmitButton"
                >
                    Dissmiss
                </button>
            </>
        </Modal>
    );
}