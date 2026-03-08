import npmLicenses from "../../assets/npm-licenses.json";
import cargoLicenses from "../../assets/cargo-licenses.json";

import styles from "./About.module.css";

interface CargoPackage {
    name: string;
    version: string;
    license_id: string;
    repository: string | null;
    text: string | null;
}

export function About() {
    const backendPackages = cargoLicenses as CargoPackage[];

    return (
        <div className={styles.aboutContainer}>
            <h1 className={styles.title}>Third-Party Software Notices</h1>

            <section className={styles.section}>
                <h2 className={styles.sectionHeader}>Frontend Dependencies</h2>
                {Object.entries(npmLicenses).map(
                    ([pkgFull, info]: [string, any]) => {
                        const parts = pkgFull.split("@");
                        const version = parts.pop();
                        const name = parts.join("@") || parts[0];

                        return (
                            <div key={pkgFull} className={styles.item}>
                                <div className={styles.meta}>
                                    <div className={styles.infoGroup}>
                                        <strong className={styles.name}>
                                            {name}
                                        </strong>
                                        <span className={styles.details}>
                                            v{version} — {info.licenses}
                                        </span>
                                    </div>
                                </div>
                                {info.licenseText ? (
                                    <pre className={styles.licenseText}>
                                        {info.licenseText}
                                    </pre>
                                ) : (
                                    <p className={styles.missingNotice}>
                                        License text missing from JSON.
                                    </p>
                                )}
                            </div>
                        );
                    },
                )}
            </section>

            <section className={styles.section}>
                <h2
                    className={`${styles.sectionHeader} ${styles.backendHeader}`}
                >
                    Backend Dependencies
                </h2>
                {backendPackages.map((pkg) => (
                    <div
                        key={`${pkg.name}-${pkg.version}`}
                        className={styles.item}
                    >
                        <div className={styles.meta}>
                            <div className={styles.infoGroup}>
                                <strong className={styles.name}>
                                    {pkg.name}
                                </strong>
                                <span className={styles.details}>
                                    Version {pkg.version} — {pkg.license_id}
                                </span>
                            </div>
                            {pkg.repository && (
                                <a
                                    href={pkg.repository}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles.sourceLink}
                                >
                                    Source
                                </a>
                            )}
                        </div>

                        {pkg.text ? (
                            <pre className={styles.licenseText}>{pkg.text}</pre>
                        ) : (
                            <p className={styles.missingNotice}>
                                License text missing
                            </p>
                        )}
                    </div>
                ))}
            </section>
        </div>
    );
}
