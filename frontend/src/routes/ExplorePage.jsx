import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHistory } from "../context/HistoryContext";

function ExplorePage() {
    const navigate = useNavigate();
    const { items, isLoading, loadSample, error } = useHistory();

    useEffect(() => {
        if (!items || items.length === 0) {
            loadSample();
        }
    }, [items, loadSample]);

    function handleBackHome() {
        navigate("/");
    }

    const isStillLoading = isLoading || !items || items.length === 0;

    if (isStillLoading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "#eee",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "16px",
                }}
            >
                <h1>Exploring your history…</h1>
                <p>{error ? "Error: ${error}" : "Loading demo data, please wait…"}</p>
                <button onClick={handleBackHome}>Back home</button>
            </div>
        );
    }

    return (
        <div style={{ padding: "24px" }}>
            <h1>Explore history</h1>
            <p style={{ margin: "12px 0" }}>
                Sample data loaded: {items.length} entries.
            </p>

            <button onClick={handleBackHome} style={{ marginBottom: "16px" }}>
                Back home
            </button>

            <p>Here we will add charts and statistics later.</p>
        </div>
    );
}

export default ExplorePage;