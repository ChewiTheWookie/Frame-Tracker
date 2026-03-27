import { Item, ItemComponent } from "../types/items";

export const calculateComponentQuantity = (
    item: Item,
    componentName: string,
    quantity: number,
): Item => {
    const updatedComponents = item.components.map((c: ItemComponent) => {
        if (c.componentName !== componentName) return c;
        const clampedQuantity = Math.min(
            Math.max(0, quantity),
            c.neededQuantity,
        );
        return { ...c, ownedQuantity: clampedQuantity };
    });

    const isNowCraftable = updatedComponents.every(
        (c) => c.ownedQuantity >= c.neededQuantity,
    );

    return {
        ...item,
        components: updatedComponents,
        craftable: isNowCraftable,
    };
};

export const calculateMasteryToggle = (
    item: Item,
    field: "mastered" | "owned" | "helminthed",
    newValue: boolean,
): Item => {
    let updatedItem = { ...item, [field]: newValue };

    if (field === "owned" && newValue === true) {
        updatedItem = {
            ...updatedItem,
            craftable: false,
            components: updatedItem.components.map((c) => ({
                ...c,
                ownedQuantity: 0,
            })),
        };
    }
    return updatedItem;
};
