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
    const [historyFilter, setHistoryFilter] = useState("");
    const { items, isLoading, error } = useHistory();

    const handleViewHistory = (filter) => {
        setHistoryFilter(filter);
        setActiveTab("history");
    };

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
                <div className="text-red-600 font-medium">
                    {error}
                </div>
                <Link
                    to="/load"
                    className="text-indigo-600 hover:text-indigo-700 underline text-xs font-medium"
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
                    className="text-indigo-600 hover:text-indigo-700 underline text-xs font-medium"
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

                <div className="mt-6 flex flex-col items-center w-full flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === "stats" && <StatsView items={items} />}
                    {activeTab === "graph" && (
                        <GraphView items={items} onViewHistory={handleViewHistory} />
                    )}
                    {activeTab === "history" && (
                        <HistoryView items={items} initialFilter={historyFilter} />
                    )}
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            <AppNav />

            <main className="flex-1 flex flex-col items-center py-8 px-6 w-full h-full overflow-hidden max-w-[1600px] mx-auto">
                {content}
            </main>
        </div>
    )
}

function TabsBar({ activeTab, onChange }) {
    return (
        <div className="flex justify-center gap-1 bg-white p-1.5 border border-slate-200 rounded-xl shadow-sm mb-2">
            {TABS.map(tab => {
                const isActive = activeTab === tab
                const label =
                    tab === "stats" ? "Overview" : tab === "graph" ? "Graph" : "History"

                return (
                    <button
                        key={tab}
                        onClick={() => onChange(tab)}
                        className={`
              px-6 py-2 text-xs font-bold uppercase tracking-wide rounded-lg
              transition-all duration-200
              ${isActive
                                ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }
            `}
                    >
                        {label}
                    </button>
                )
            })}
        </div>
    )
}