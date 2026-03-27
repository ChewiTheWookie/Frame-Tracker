import { useRoutes } from "react-router-dom";
import { ROUTES } from "./routes/routes";
import { Navbar } from "./components/Navbar";
import { AppInitializer } from "./components/AppInitializer";

function App() {
    return (
        <>
            <AppInitializer />

            <Navbar />
            {useRoutes(ROUTES)}
        </>
    );
}

export default App;
