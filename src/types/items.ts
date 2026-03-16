export interface ItemComponent {
    id: number;
    componentName: string;
    neededQuantity: number;
    ownedQuantity: number;
}

export interface Item {
    id: string;
    name: string;
    category: string;
    mastered: boolean;
    helminthed: boolean;
    owned: boolean;
    craftable: boolean;
    imgPath: string;
    components: ItemComponent[];
}
