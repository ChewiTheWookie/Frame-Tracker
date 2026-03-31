import { useRoutes } from "react-router-dom";
import { ROUTES } from "@/routes/routes";
import { Navbar } from "@/layouts/Navbar";
import { useAppInitilization } from "@/hooks/useAppInitilization";

function App() {
    useAppInitilization();

    return (
        <>
            <Navbar />
            {useRoutes(ROUTES)}
        </>
    );
}

export default App;
