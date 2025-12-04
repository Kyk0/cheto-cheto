import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHistory } from "../context/HistoryContext";

function ExplorePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { items, isLoading, error, loadSample } = useHistory();

    const mode = location.state?.mode || "user";

    useEffect(() => {
        if (mode === "sample" && (!items || items.length === 0)) {
            loadSample().catch(() => {});
        }
    }, [mode, items, loadSample]);

    function handleBackHome() {
        navigate("/");
    }

    const isStillLoading =
        isLoading || (mode === "sample" && (!items || items.length === 0));

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
                <p>
                    {error
                        ? `Error: ${error}`
                        : mode === "sample"
                            ? "Loading demo data, please wait…"
                            : "Processing your history…"}
                </p>
                <button onClick={handleBackHome}>Back home</button>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div style={{ padding: "24px" }}>
                <h1>Explore history</h1>
                <p>No history data available.</p>
                <button onClick={handleBackHome}>Back home</button>
            </div>
        );
    }

    return (
        <div style={{ padding: "24px" }}>
            <h1>Explore history</h1>
            <p style={{ margin: "8px 0" }}>
                Loaded entries: {items.length}
                {mode === "sample" ? " (demo sample)" : " (your file)"}
            </p>

            <button onClick={handleBackHome} style={{ marginBottom: "16px" }}>
                Back home
            </button>

            <div
                style={{
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "8px",
                    maxHeight: "70vh",
                    overflowY: "auto",
                    fontSize: "14px",
                }}
            >
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        style={{
                            paddingBottom: "8px",
                            marginBottom: "8px",
                            borderBottom: "1px solid #eee",
                        }}
                    >
                        <div style={{ fontWeight: "bold" }}>
                            {item.title || "(no title)"}
                        </div>
                        <div style={{ color: "#555" }}>
                            {item.url || "(no url)"}
                        </div>
                        <div style={{ marginTop: "4px" }}>
                            <span style={{ fontWeight: "bold" }}>Host:</span>{" "}
                            {item.host}
                        </div>
                        <div>
                            <span style={{ fontWeight: "bold" }}>
                                Predicted topic:
                            </span>{" "}
                            {item.pred_topic}{" "}
                            {item.pred_prob != null &&
                                `(${(item.pred_prob * 100).toFixed(1)}%)`}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ExplorePage;