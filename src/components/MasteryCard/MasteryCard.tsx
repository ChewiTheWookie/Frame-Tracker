import { memo } from "react";
import { Item, ItemComponent } from "../../types/items";
import { Card } from "../Card";
import { CardButton } from "../CardButton";

import styles from "./MasteryCard.module.css";

interface Props {
    item: Item;
    toggleMastery: (
        itemId: string,
        field: "mastered" | "owned" | "helminthed",
    ) => void;
    updateComponentQuantity: (
        itemId: string,
        compName: string,
        qty: number,
    ) => void;
}

function InternalMasteryCard({
    item,
    toggleMastery,
    updateComponentQuantity,
}: Props) {
    const handleToggle = (field: "mastered" | "owned" | "helminthed") => {
        toggleMastery(item.id, field);
    };

    const adjustQuantity = (comp: ItemComponent, delta: number) => {
        updateComponentQuantity(
            item.id,
            comp.componentName,
            comp.ownedQuantity + delta,
        );
    };

    let completedStyle = "unowned";
    let isCompleted = false;

    if (item.mastered && item.helminthed) {
        completedStyle = "masteredHelminthed";
        isCompleted = true;
    } else if (item.mastered) {
        completedStyle = "mastered";
        isCompleted = true;
    } else if (item.helminthed) {
        completedStyle = "helminthed";
        isCompleted = true;
    } else if (item.owned) {
        completedStyle = "owned";
        isCompleted = true;
    } else if (item.craftable) {
        completedStyle = "craftable";
        isCompleted = true;
    }

    const front = (
        <>
            <div className={styles.imageContainer}>
                <img
                    src={"https://cdn.warframestat.us/img/" + item.imgPath}
                    alt={item.name}
                    onError={(e) =>
                        (e.currentTarget.src =
                            "https://placehold.co/200x200/0b0e12/c1ac6c?text=No+Image")
                    }
                />
            </div>

            <div className={styles.footer}>
                <h4 className={styles.name}>{item.name}</h4>
                <div className={styles.controls}>
                    <CardButton
                        label="Master"
                        activeLabel="Mastered"
                        isActive={item.mastered}
                        onClick={() => handleToggle("mastered")}
                    />
                    {/* TODO Change icons to lucide icons */}
                    {item.category === "Warframes" &&
                        !item.name.includes("Prime") && (
                            <CardButton
                                label="🔘 Feed"
                                activeLabel="🧬 Fed"
                                isActive={item.helminthed}
                                variant="helminth"
                                onClick={() => handleToggle("helminthed")}
                            />
                        )}
                </div>
            </div>
        </>
    );

    const back = (
        <>
            <h4 className={styles.nameBack}>{item.name}</h4>
            <div className={styles.componentList}>
                {item.components.map((comp) => (
                    <div
                        key={comp.componentName}
                        className={styles.componentRow}
                    >
                        <span className={styles.componentName}>
                            {comp.componentName}: {comp.ownedQuantity}/
                            {comp.neededQuantity}
                        </span>
                        <div className={styles.componentRowControls}>
                            <button
                                className={styles.componentButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    adjustQuantity(comp, -1);
                                }}
                            >
                                -
                            </button>
                            <button
                                className={styles.componentButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    adjustQuantity(comp, 1);
                                }}
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.backControls}>
                <CardButton
                    label="Unowned"
                    activeLabel="Owned"
                    isActive={item.owned}
                    onClick={() => handleToggle("owned")}
                />
            </div>
        </>
    );

    return (
        <Card
            front={front}
            back={back}
            completed={isCompleted}
            completedStyle={completedStyle}
        />
    );
}

export const MasteryCard = memo(InternalMasteryCard);
