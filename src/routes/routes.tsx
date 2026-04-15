import { RouteObject } from "react-router-dom";
import { PATHS } from "./paths";
import { MainLayout } from "@/layouts/MainLayout";
import { PopUpLayout } from "@/layouts/PopUpLayout";
import { MasteryTracker } from "@/pages/MasteryTracker";
import { TaskTracker } from "@/pages/TaskTracker";
import { Settings } from "@/pages/Settings";
import { Acknowledgments } from "@/pages/Settings/popups/Acknowledgments";
import { Profile } from "@/pages/Profile";
import { Keybinds } from "@/pages/Settings/popups/Keybinds";
import { MusicSaver } from "@/pages/MusicSaver";
import { ListLayout } from "@/layouts/ListLayout";

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
                element: <ListLayout />,
                children: [
                    {
                        path: PATHS.Music,
                        element: <MusicSaver />,
                    },
                ],
            },

            {
                path: PATHS.Settings,
                element: <Settings />,
                children: [
                    {
                        element: <PopUpLayout />,
                        children: [
                            {
                                path: PATHS.Acknowledgments,
                                element: <Acknowledgments />,
                            },
                            {
                                path: PATHS.Keybinds,
                                element: <Keybinds />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        element: <ListLayout />,
        children: [
            {
                path: PATHS.Profile,
                element: <Profile />,
            },
        ],
    },
];
