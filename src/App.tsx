import { useRoutes } from "react-router-dom";
import { ROUTES } from "@/routes/routes";
import { useAppInitialization } from "@/hooks/useAppInitilization";

function App() {
    useAppInitialization();

    return <>{useRoutes(ROUTES)}</>;
}

export default App;
