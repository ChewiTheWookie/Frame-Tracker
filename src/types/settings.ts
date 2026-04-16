import { ReactNode } from "react";

export interface SettingItem {
    label: string;
    onClick: () => void | Promise<void>;
    rightElement?: ReactNode;
}

export interface SettingSection {
    title: string;
    icon: ReactNode;
    items: SettingItem[];
}
