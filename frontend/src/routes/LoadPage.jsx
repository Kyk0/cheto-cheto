import { useNavigate } from "react-router-dom";

function LoadPage() {
    const navigate = useNavigate();

    function handleUseSample() {
        navigate("/explore");
    }

    function handleBackHome() {
        navigate("/");
    }

    return (
        <div style={{ padding: "24px" }}>
            <h1>Load history</h1>
            <p style={{ margin: "12px 0" }}>
                Here you will be able to upload your own browsing history. For now you
                can try the demo sample.
            </p>

            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button onClick={handleUseSample}>
                    Use sample history
                </button>

                <button onClick={handleBackHome}>
                    Back home
                </button>
            </div>
        </div>
    );
}

export default LoadPage;