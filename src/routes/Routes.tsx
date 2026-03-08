import { About } from "../pages/About";
import { MasteryTracker } from "../pages/MasteryTracker";
import { WeeklyTracker } from "../pages/WeeklyTracker";

export const ROUTES = [
    {
        name: "Mastery Tracker",
        path: "/",
        element: <MasteryTracker />,
        key: "mastery",
    },
    {
        name: "Weekly Task",
        path: "/weekly",
        element: <WeeklyTracker />,
        key: "weekly",
    },
    {
        name: "About",
        path: "/about",
        element: <About />,
        key: "about",
    },
];
