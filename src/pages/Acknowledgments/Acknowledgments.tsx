import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import {
    useLicenseStore,
    useFrontendLicenses,
    useBackendLicenses,
    useLicenseDetail,
} from "../../stores/useLicenseStore";
import { Throbber } from "../../components/Throbber";
import { ScrollToTop } from "../../components/ScrollToTop";

import styles from "./Acknowledgments.module.css";

interface SummaryProps {
    id: string;
    name: string;
    version: string | null;
}

function LicenseItem({ item }: { item: SummaryProps }) {
    const fetchDetailed = useLicenseStore((s) => s.fetchDetailed);
    const details = useLicenseDetail(item.id);

    return (
        <details
            className={styles.item}
            onToggle={(e) => {
                if ((e.target as HTMLDetailsElement).open) {
                    fetchDetailed(item.id);
                }
            }}
        >
            <summary className={styles.itemHeader}>
                <ChevronRight size={16} className={styles.chevronIcon} />
                <strong className={styles.itemName}>{item.id} </strong>
                <span className={styles.info}>
                    v{item.version} - {item.name}
                </span>
            </summary>

            {details ? (
                <div className={styles.itemDetailsContent}>
                    <span className={styles.itemDetailsSpan}>
                        {details.repository && (
                            <>
                                <strong>Repo:</strong>
                                <a
                                    href={details.repository}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {details.repository}
                                </a>
                            </>
                        )}
                        {details.author && (
                            <>
                                {details.repository && " | "}
                                <strong>Author:</strong> {details.author}
                            </>
                        )}
                    </span>
                    <pre className={styles.itemDetailsPre}>
                        {details.license_text || "Full license text not found."}
                    </pre>
                </div>
            ) : (
                <Throbber label={"Fetching details"} />
            )}
        </details>
    );
}

export function Acknowledgments() {
    const navigate = useNavigate();
    const fetchSummaries = useLicenseStore((s) => s.fetchSummaries);
    const isLoading = useLicenseStore((s) => s.isLoading);

    const frontend = useFrontendLicenses();
    const backend = useBackendLicenses();

    useEffect(() => {
        fetchSummaries();
    }, [fetchSummaries]);

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>Third-Party Software Notices</h1>
                <button
                    className={styles.closeBtn}
                    onClick={() => navigate(-1)}
                >
                    <X size={20} className={styles.closeIcon} />
                </button>
            </header>

            <div className={styles.scrollContainer}>
                {isLoading ? (
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
                <ScrollToTop />
            </div>
        </div>
    );
}
