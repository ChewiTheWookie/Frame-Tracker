import { useRoutes } from "react-router-dom";
import { ROUTES } from "@/routes/routes";
import { useAppInitilization } from "@/hooks/useAppInitilization";

function App() {
    useAppInitilization();

    return <>{useRoutes(ROUTES)}</>;
}

export default App;
