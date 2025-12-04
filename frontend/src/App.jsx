import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./routes/HomePage";
import LoadPage from "./routes/LoadPage";
import ExplorePage from "./routes/ExplorePage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/load" element={<LoadPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;