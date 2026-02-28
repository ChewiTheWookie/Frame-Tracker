import { MasteryTracker } from "../pages/MasteryTracker";
import { DailysTracker } from "../pages/DailysTracker";

export const ROUTES = [
    {
        name: "Mastery Tracker",
        path: "/",
        element: <MasteryTracker />,
        key: "mastery",
    },
    {
        name: "Daily Checklist",
        path: "/DailysTracker",
        element: <DailysTracker />,
        key: "dailys",
    },
];
