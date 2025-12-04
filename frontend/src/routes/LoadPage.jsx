import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHistory } from "../context/HistoryContext";

function LoadPage() {
    const navigate = useNavigate();
    const { loadSample, uploadHistory, isLoading, error } = useHistory();
    const [localError, setLocalError] = useState(null);

    async function handleUseSample() {
        setLocalError(null);
        try {
            await loadSample();
            navigate("/explore");
        } catch (e) {
            setLocalError(e.message || "Failed to load sample");
        }
    }

    async function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        setLocalError(null);
        try {
            await uploadHistory(file);
            navigate("/explore");
        } catch (e) {
            setLocalError(e.message || "Failed to upload history");
        } finally {
            // сбросим value, чтобы тот же файл можно было выбрать ещё раз
            e.target.value = "";
        }
    }

    function handleBackHome() {
        navigate("/");
    }

    return (
        <div style={{ padding: "24px", maxWidth: "600px" }}>
            <h1>Load history</h1>
            <p style={{ margin: "12px 0" }}>
                You can upload your own Safari history database or try a demo sample.
            </p>

            <div style={{ margin: "16px 0" }}>
                <p>Upload Safari History.db:</p>
                <input
                    type="file"
                    accept=".db"
                    onChange={handleFileChange}
                    disabled={isLoading}
                />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button onClick={handleUseSample} disabled={isLoading}>
                    Use sample history
                </button>

                <button onClick={handleBackHome} disabled={isLoading}>
                    Back home
                </button>
            </div>

            {isLoading && (
                <p style={{ marginTop: "12px" }}>
                    Processing history, please wait…
                </p>
            )}

            {(error || localError) && (
                <p style={{ marginTop: "12px", color: "red" }}>
                    {error || localError}
                </p>
            )}
        </div>
    );
}

export default LoadPage;