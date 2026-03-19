import { useEffect } from "react";
import { useRoutes } from "react-router-dom";
import { ROUTES } from "./routes/routes";
import { useTimeStore } from "./stores/useTimeStore";
import { Navbar } from "./components/Navbar";

function App() {
    const updateTime = useTimeStore((state) => state.updateTime);

    useEffect(() => {
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, [updateTime]);

    return (
        <>
            <Navbar />
            {useRoutes(ROUTES)}
        </>
    );
}

export default App;
