import { useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import {
    useLicenseStore,
    useFrontendLicenses,
    useBackendLicenses,
    useLicenseDetail,
    useLicenseActions,
} from "@/stores/useLicenseStore";
import { Throbber } from "@/components/ui/Throbber";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

import styles from "./Acknowledgments.module.css";

export function Acknowledgments() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const { fetchSummaries } = useLicenseActions();
    const isLoading = useLicenseStore((s) => s.isLoading);

    const frontend = useFrontendLicenses();
    const backend = useBackendLicenses();

    useEffect(() => {
        fetchSummaries();
    }, [fetchSummaries]);

    return (
        <div className={styles.scrollContainer} ref={scrollRef}>
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
            <ScrollToTop targetRef={scrollRef} />
        </div>
    );
}

interface SummaryProps {
    id: string;
    name: string;
    version: string | null;
}

function LicenseItem({ item }: { item: SummaryProps }) {
    const { fetchDetailed } = useLicenseActions();
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
                    {item.version ? `v${item.version}` : ""} - {item.name}
                </span>
            </summary>

            <div className={styles.itemDetailsContent}>
                {details ? (
                    <>
                        <span className={styles.itemDetailsSpan}>
                            {details.repository && (
                                <>
                                    <strong>Repo:</strong>{" "}
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
                            {details.license_text ||
                                "Full license text not found."}
                        </pre>
                    </>
                ) : (
                    <Throbber label={"Fetching details"} />
                )}
            </div>
        </details>
    );
}
