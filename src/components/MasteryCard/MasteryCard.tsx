import { memo, useMemo } from "react";
import { ItemComponent } from "../../types/items";
import { Card } from "../Card";
import { CardButton } from "../CardButton";
import { useItemById, useMasteryStore } from "../../stores/useMasteryStore";

import styles from "./MasteryCard.module.css";
import { Dna, DnaOff } from "lucide-react";

interface Props {
    itemId: string;
}

const NO_IMAGE_URL = "https://placehold.co/200x200/0b0e12/c1ac6c?text=No+Image";
const WARFRAME_CDN = "https://cdn.warframestat.us/img/";

function InternalMasteryCard({ itemId }: Props) {
    const item = useItemById(itemId);
    const toggleMastery = useMasteryStore((s) => s.toggleMastery);
    const updateComponentQuantity = useMasteryStore(
        (s) => s.updateComponentQuantity,
    );

    const { completedStyle, isCompleted } = useMemo(() => {
        if (!item) return { completedStyle: "unowned", isCompleted: false };

        if (item.mastered && item.helminthed)
            return { completedStyle: "masteredHelminthed", isCompleted: true };
        if (item.mastered)
            return { completedStyle: "mastered", isCompleted: true };
        if (item.helminthed)
            return { completedStyle: "helminthed", isCompleted: true };
        if (item.owned) return { completedStyle: "owned", isCompleted: true };
        if (item.craftable)
            return { completedStyle: "craftable", isCompleted: true };

        return { completedStyle: "unowned", isCompleted: false };
    }, [item]);

    if (!item) return null;

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

    const showHelminth =
        item.category === "Warframes" && !item.name.includes("Prime");

    const front = (
        <>
            <div className={styles.imageContainer}>
                <img
                    src={`${WARFRAME_CDN}${item.imgPath}`}
                    alt={item.name}
                    onError={(e) => (e.currentTarget.src = NO_IMAGE_URL)}
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
                    {showHelminth && (
                        <CardButton
                            label={
                                <>
                                    <DnaOff size={10} /> Feed
                                </>
                            }
                            activeLabel={
                                <>
                                    <Dna size={10} /> Fed
                                </>
                            }
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
