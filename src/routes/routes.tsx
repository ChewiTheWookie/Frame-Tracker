import { RouteObject } from "react-router-dom";
import { PATHS } from "./paths";
import { MasteryTracker } from "../pages/MasteryTracker";
import { TaskTracker } from "../pages/TaskTracker";
import { Settings } from "../pages/Settings";
import { Acknowledgments } from "../pages/Acknowledgments";

export const ROUTES: RouteObject[] = [
    {
        path: PATHS.Mastery,
        element: <MasteryTracker />,
    },
    {
        path: PATHS.Tasks,
        element: <TaskTracker />,
    },
    {
        path: PATHS.Settings,
        element: <Settings />,
    },
    {
        path: PATHS.Acknowledgments,
        element: <Acknowledgments />,
    },
];
