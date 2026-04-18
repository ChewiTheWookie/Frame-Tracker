import { useEffect, useState } from "react";
import {
    useLicenseStore,
    useFrontendLicenses,
    useBackendLicenses,
    useLicenseDetail,
    useLicenseActions,
} from "@/stores/useLicenseStore";
import { Throbber } from "@/components/ui/Throbber";

import styles from "./Acknowledgments.module.css";
import { ListItem } from "@/components/ui/ListItem";
import { CardButton } from "@/components/ui/CardButton";
import { Modal } from "@/components/ui/Modal";

export function Acknowledgments() {
    const { fetchSummaries } = useLicenseActions();
    const isLoading = useLicenseStore((s) => s.isLoading);

    const frontend = useFrontendLicenses();
    const backend = useBackendLicenses();

    useEffect(() => {
        fetchSummaries();
    }, [fetchSummaries]);

    return (
        <>
            {isLoading && frontend.length === 0 ? (
                <Throbber label="Loading summaries" />
            ) : (
                <>
                    <section className={styles.section}>
                        <h2 className={styles.sectionHeader}>
                            Frontend Dependencies
                        </h2>
                        {frontend.map((item) => (
                            <LicenseItem key={item.id} item={item} />
                        ))}
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionHeader}>
                            Backend Dependencies
                        </h2>
                        {backend.map((item) => (
                            <LicenseItem key={item.id} item={item} />
                        ))}
                    </section>
                </>
            )}
        </>
    );
}

interface SummaryProps {
    id: string;
    name: string;
    version: string | null;
}

function LicenseItem({ item }: { item: SummaryProps }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { fetchDetailed } = useLicenseActions();
    const details = useLicenseDetail(item.id);

    const handleOpenModal = () => {
        setIsModalOpen(true);
        if (!details) {
            fetchDetailed(item.id);
        }
    };

    return (
        <>
            <ListItem
                title={
                    <>
                        {item.id}:
                        <span className="ModalTitleSecondary">
                            {" "}
                            {item.version ? `v${item.version}` : ""} -{" "}
                            {item.name}
                        </span>
                    </>
                }
                button={
                    <CardButton
                        label="Show License Text"
                        onClick={handleOpenModal}
                        width="12rem"
                    />
                }
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`${item.id} License`}
            >
                <div className={styles.modalScrollArea}>
                    {details ? (
                        <div className={styles.licenseDetails}>
                            <div className={styles.meta}>
                                {details.repository && (
                                    <p className="ModalInput">
                                        <strong>Repository:</strong>{" "}
                                        <a
                                            href={details.repository}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {details.repository}
                                        </a>
                                    </p>
                                )}
                                {details.author && (
                                    <p className="ModalInput">
                                        <strong>Author:</strong>{" "}
                                        {details.author}
                                    </p>
                                )}
                            </div>

                            <hr className={styles.divider} />

                            <pre className="ModalTextarea">
                                {details.license_text ||
                                    "Full license text not found."}
                            </pre>
                        </div>
                    ) : (
                        <div className={styles.loadingContainer}>
                            <Throbber label="Loading license information..." />
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
