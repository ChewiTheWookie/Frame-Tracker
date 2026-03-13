import { useEffect, useState, useRef, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Throbber } from "../../components/Throbber";
import { ScrollToTop } from "../../components/ScrollToTop";

import styles from "./Acknowledgments.module.css";

interface CargoPackage {
    name: string;
    version: string;
    license_id: string;
    repository: string | null;
    text: string | null;
}

export function Acknowledgments() {
    const [npmData, setNpmData] = useState<Record<string, any>>({});
    const [cargoData, setCargoData] = useState<CargoPackage[]>([]);
    const [visibleCount, setVisibleCount] = useState(10);
    const [loading, setLoading] = useState(true);
    const observerTarget = useRef(null);

    useEffect(() => {
        async function loadData() {
            try {
                const npmRaw = await invoke<string>("acknowledgment", {
                    name: "npm-licenses",
                });
                const cargoRaw = await invoke<string>("acknowledgment", {
                    name: "cargo-licenses",
                });
                setNpmData(JSON.parse(npmRaw));
                setCargoData(JSON.parse(cargoRaw));
            } catch (e) {
                console.error("Failed to load licenses", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    setVisibleCount((prev) => prev + 10);
                }
            },
            { threshold: 0.1 },
        );

        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [loading]);

    const npmEntries = useMemo(() => Object.entries(npmData), [npmData]);
    const visibleNpm = npmEntries.slice(0, visibleCount);

    const remainingCount = visibleCount - npmEntries.length;
    const visibleCargo =
        remainingCount > 0 ? cargoData.slice(0, remainingCount) : [];

    if (loading) return <Throbber />;

    return (
        <div className={styles.aboutContainer}>
            <h1 className={styles.title}>Third-Party Software Notices</h1>

            <section className={styles.section}>
                <h2 className={styles.sectionHeader}>Frontend Dependencies</h2>
                {visibleNpm.map(([pkgFull, info]) => {
                    const parts = pkgFull.split("@");
                    const version = parts.pop();
                    const name = parts.join("@") || parts[0];

                    return (
                        <details key={pkgFull} className={styles.item}>
                            <summary className={styles.itemHeader}>
                                <strong className={styles.name}>{name}</strong>
                                <span className={styles.details}>
                                    v{version} — {info.licenses}
                                </span>
                            </summary>
                            {info.licenseText ? (
                                <pre className={styles.licenseText}>
                                    {info.licenseText}
                                </pre>
                            ) : (
                                <p className={styles.missingNotice}>
                                    Text missing
                                </p>
                            )}
                        </details>
                    );
                })}
            </section>

            {visibleCargo.length > 0 && (
                <section className={styles.section}>
                    <h2
                        className={`${styles.sectionHeader} ${styles.backendHeader}`}
                    >
                        Backend Dependencies
                    </h2>
                    {visibleCargo.map((pkg) => (
                        <details
                            key={`${pkg.name}-${pkg.version}`}
                            className={styles.item}
                        >
                            <summary className={styles.itemHeader}>
                                <strong className={styles.name}>
                                    {pkg.name}
                                </strong>
                                <span className={styles.details}>
                                    v{pkg.version} — {pkg.license_id}
                                </span>
                            </summary>
                            {pkg.text ? (
                                <pre className={styles.licenseText}>
                                    {pkg.text}
                                </pre>
                            ) : (
                                <p className={styles.missingNotice}>
                                    Text missing
                                </p>
                            )}
                        </details>
                    ))}
                </section>
            )}

            <div ref={observerTarget} className={styles.missingNotice}>
                {visibleCount < npmEntries.length + cargoData.length
                    ? "Scrolling for more..."
                    : "End of notices"}
            </div>

            <ScrollToTop />
        </div>
    );
}
