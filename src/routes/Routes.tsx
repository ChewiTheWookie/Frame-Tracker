import { RouteObject } from "react-router-dom";
import { PATHS } from "./paths";
import { Acknowledgments } from "../pages/Acknowledgments";
import { MasteryTracker } from "../pages/MasteryTracker";
import { WeeklyTracker } from "../pages/WeeklyTracker";

export const ROUTES: RouteObject[] = [
    {
        path: PATHS.Mastery,
        element: <MasteryTracker />,
    },
    {
        path: PATHS.Weekly,
        element: <WeeklyTracker />,
    },
    {
        path: PATHS.Acknowledgments,
        element: <Acknowledgments />,
    },
];
