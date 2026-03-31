import { RouteObject } from "react-router-dom";
import { PATHS } from "./paths";
import { MasteryTracker } from "@/pages/MasteryTracker";
import { TaskTracker } from "@/pages/TaskTracker";
import { Settings } from "@/pages/Settings";
import { Acknowledgments } from "@/pages/Acknowledgments";
import { Profile } from "@/pages/Profile";
import { MainLayout } from "@/layouts/MainLayout";

export const ROUTES: RouteObject[] = [
    {
        element: <MainLayout />,
        children: [
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
                children: [
                    {
                        path: PATHS.Acknowledgments,
                        element: <Acknowledgments />,
                    },
                ],
            },
            {
                path: PATHS.Profile,
                element: <Profile />,
            },
        ],
    },
];
