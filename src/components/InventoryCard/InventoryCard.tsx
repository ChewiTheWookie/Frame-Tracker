import { Item } from "../../types/inventory";
import { useActiveStore } from "../../hooks/useActiveStore";
import { Card } from "../Card/Card";
import { CardButton } from "../CardButton";

import styles from "./InventoryCard.module.css";

interface Props {
    item: Item;
}

export const InventoryCard = ({ item }: Props) => {
    const { store } = useActiveStore();
    const { toggleStatus, togglePart, showAllBacks } = store;

    const statusClasses = `
        ${item.mastered ? styles.mastered : ""} 
        ${item.helminthed ? styles.helminthed : ""} 
        ${item.craftable ? styles.craftable : ""} 
        ${item.owned ? styles.owned : ""}
    `;

    const FrontContent = (
        <div className={`${styles.contentWrapper} ${statusClasses}`}>
            <div className={styles.imageContainer}>
                <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) =>
                        (e.currentTarget.src =
                            "https://placehold.co/200x200/0b0e12/c1ac6c?text=No+Image")
                    }
                />
            </div>
            <div>
                <h4 className={styles.cardInfoH4}>{item.name}</h4>
                <div className={styles.cardActions}>
                    <CardButton
                        label="UNRANKED"
                        activeLabel="MASTERED"
                        isActive={item.mastered}
                        onClick={() => toggleStatus?.(item.id, "mastered")}
                    />
                    {item.isFeedable && (
                        <CardButton
                            label="🔘 FEED"
                            activeLabel="🧬 FED"
                            isActive={item.helminthed}
                            variant="helminth"
                            onClick={() =>
                                toggleStatus?.(item.id, "helminthed")
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    );

    const BackContent = (
        <div className={`${styles.contentWrapper} ${statusClasses}`}>
            <h4 className={styles.cardTitle}>{item.name}</h4>
            <div className={styles.partsList}>
                {item.parts &&
                    Object.entries(item.parts).map(([partName, owned]) => (
                        <div
                            key={partName}
                            className={`${styles.partRow} ${owned ? styles.partOwned : ""}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                togglePart?.(item.id, partName);
                            }}
                        >
                            <div className={styles.checkbox}>
                                {owned ? "✓" : ""}
                            </div>
                            <span>{partName}</span>
                        </div>
                    ))}
            </div>
            <div className={styles.cardActions}>
                <CardButton
                    label="UNOWNED"
                    activeLabel="OWNED"
                    isActive={item.owned}
                    onClick={() => toggleStatus?.(item.id, "owned")}
                />
            </div>
        </div>
    );

    return (
        <Card
            front={FrontContent}
            back={BackContent}
            isFlippedContent={showAllBacks}
        />
    );
};
