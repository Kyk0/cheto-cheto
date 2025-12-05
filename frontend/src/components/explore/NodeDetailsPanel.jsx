import { useMemo } from "react"

export default function NodeDetailsPanel({ node, onClose, onViewHistory }) {
    if (!node) return null

    return (
        <div className="absolute bottom-0 right-0 w-80 max-h-[50vh] bg-white border-t border-l border-stone-200 shadow-xl flex flex-col z-20">

            <div className="p-4 border-b border-stone-100 flex items-start justify-between bg-stone-50">
                <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-stone-500 mb-1">
                        {node.kind === "hub" ? "Topic" : "Host"}
                    </div>
                    <h2 className="text-lg font-bold text-stone-800 break-all leading-tight">
                        {node.label}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-stone-400 hover:text-stone-600 transition-colors p-1"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>


            <div className="flex border-b border-stone-100 divide-x divide-stone-100">
                <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-stone-400 uppercase tracking-wide">Visits</div>
                    <div className="text-xl font-bold text-stone-800">{node.count}</div>
                </div>
                <div className="flex-1 p-3 text-center">
                    <div className="text-xs text-stone-400 uppercase tracking-wide">Topic</div>
                    <div className="text-sm font-medium text-stone-700 truncate px-2">
                        {node.topic || "other"}
                    </div>
                </div>
            </div>


            <div className="flex-1 overflow-y-auto p-0 bg-white">
                <div className="p-3 text-xs font-semibold text-stone-400 uppercase tracking-wider bg-stone-50/50 sticky top-0 border-b border-stone-100">
                    Connections / URLs
                </div>
                <ul className="divide-y divide-stone-50">
                    {node.urls && node.urls.length > 0 ? (
                        node.urls.map((url, idx) => (
                            <li key={idx} className="p-3 hover:bg-stone-50 transition-colors">
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-stone-600 truncate font-medium hover:text-indigo-600 hover:underline block"
                                    title={url}
                                >
                                    {url}
                                </a>
                            </li>
                        ))
                    ) : (
                        <li className="p-4 text-center text-xs text-stone-400">
                            No detailed URLs available.
                        </li>
                    )}
                </ul>
            </div>


            <div className="p-3 border-t border-stone-100 bg-stone-50">
                <button
                    onClick={() => onViewHistory(node.label || "")}
                    className="w-full py-2 px-4 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                    <span>View in History</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                    </svg>
                </button>
            </div>
        </div>
    )
}
