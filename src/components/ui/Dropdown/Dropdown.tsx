import styles from "./Dropdown.module.css"

interface Props {
    isOpen: boolean;
    title?: string;
    items: React.ReactNode;
    top?: string;
    width?: string;
    padding?: string;
}

export function Dropdown({ isOpen, title, items, top = "calc(100% + 5px)", width, padding = "4px" }: Props) {
    return (
        <>
            {isOpen && (
                <div className={styles.dropdown}
                    style={{
                        top: top,
                        width: width,
                        padding: padding
                    }}
                >
                    {title && (
                        <div className={styles.title}>
                            {title}
                        </div>
                    )}
                    {items}
                </div>
            )}
        </>

    )
}