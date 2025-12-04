import {useNavigate} from "react-router-dom";

function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="p-6">
            <h1 className="text-2xl mb-4">MyCoolHistory.app</h1>
            <p className="mb-6">
                Simple placeholder text about what this app does. We&apos;ll replace it later.
            </p>

            <button
                className="px-4 py-2 border rounded"
                onClick={() => navigate("/load")}
            >
                Try it
            </button>
        </div>
    );
}

export default HomePage;