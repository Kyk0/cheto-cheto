// src/routes/ExplorePage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useHistory } from "../context/HistoryContext";
import AppNav from "../components/layout/AppNav";
import StatsView from "../components/explore/StatsView";
import GraphView from "../components/explore/GraphView";
import HistoryView from "../components/explore/HistoryView";

const TABS = ["stats", "graph", "history"];

export default function ExplorePage() {
    const [activeTab, setActiveTab] = useState("stats");
    const { items, isLoading, error } = useHistory();

    // базовые состояния загрузки / ошибки / пустых данных
    let content;

    if (isLoading) {
        content = (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
                Loading history…
            </div>
        );
    } else if (error) {
        content = (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-sm">
                <div className="text-red-600">
                    {error}
                </div>
                <Link
                    to="/load"
                    className="text-slate-700 underline text-xs"
                >
                    Go back to load history
                </Link>
            </div>
        );
    } else if (!items || items.length === 0) {
        content = (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-sm text-slate-500">
                <div>No history loaded.</div>
                <Link
                    to="/load"
                    className="text-slate-700 underline text-xs"
                >
                    Load sample or upload your history
                </Link>
            </div>
        );
    } else {
        // нормальный режим: данные есть
        content = (
            <>
                <TabsBar activeTab={activeTab} onChange={setActiveTab} />

                <div className="mt-4 flex flex-col items-center w-full">
                    {activeTab === "stats" && <StatsView items={items} />}
                    {activeTab === "graph" && <GraphView items={items} />}
                    {activeTab === "history" && <HistoryView items={items} />}
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <AppNav />

            <main className="flex-1 flex flex-col items-center py-6 px-4 w-full">
                {content}
            </main>
        </div>
    );
}

function TabsBar({ activeTab, onChange }) {
    return (
        <div className="flex justify-center gap-4">
            {TABS.map((tab) => {
                const isActive = activeTab === tab;
                const label =
                    tab === "stats" ? "Stats" :
                        tab === "graph" ? "Graph" :
                            "History";

                return (
                    <button
                        key={tab}
                        onClick={() => onChange(tab)}
                        className={`
              px-4 py-2 text-xs uppercase tracking-wide
              border-b-2
              transition-colors duration-150
              ${isActive
                            ? "border-slate-900 text-slate-900"
                            : "border-transparent text-slate-500 hover:text-slate-800"}
            `}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}