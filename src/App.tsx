import { useEffect } from "react";
import { useRoutes } from "react-router-dom";
import { ROUTES } from "./routes/routes";
import { useTimeStore } from "./stores/useTimeStore";
import { Navbar } from "./components/Navbar";

import styles from "./styles/App.module.css";

function App() {
    const updateTime = useTimeStore((state) => state.updateTime);

    useEffect(() => {
        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, [updateTime]);

    return (
        <div className={styles.appContainer}>
            <Navbar />
            {useRoutes(ROUTES)}
        </div>
    );
}

export default App;
