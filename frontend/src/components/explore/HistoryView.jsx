import { useState, useMemo, useEffect } from "react"

export default function HistoryView({ items, initialFilter = "" }) {
    const [filter, setFilter] = useState(initialFilter)

    useEffect(() => {
        if (initialFilter) setFilter(initialFilter)
    }, [initialFilter])

    const filteredItems = useMemo(() => {
        if (!filter) return items || []
        const lower = filter.toLowerCase()
        return (items || []).filter(item => {
            return (
                (item.host && item.host.toLowerCase().includes(lower)) ||
                (item.title && item.title.toLowerCase().includes(lower)) ||
                (item.url && item.url.toLowerCase().includes(lower)) ||
                (item.pred_topic && item.pred_topic.toLowerCase().includes(lower))
            )
        })
    }, [items, filter])

    const totalItems = items?.length ?? 0
    const displayedCount = filteredItems.length

    return (
        <section className="w-full max-w-6xl h-[85vh] flex flex-col gap-4">
            {/* Header & Filter */}
            <div className="bg-white border border-slate-200 p-4 shadow-sm rounded-lg flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">History Explorer</h2>
                    <p className="text-xs text-slate-500">
                        Showing <span className="font-semibold text-indigo-600">{displayedCount}</span> of{" "}
                        {totalItems} records
                    </p>
                </div>
                <div className="w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="Filter by host, topic, or title..."
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1 p-0">
                    {filteredItems.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                            No matching records found.
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs w-48">
                                        Time
                                    </th>
                                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs w-48">
                                        Host
                                    </th>
                                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs">
                                        Title / URL
                                    </th>
                                    <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider text-xs w-32">
                                        Topic
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredItems.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        className="hover:bg-indigo-50 transition-colors group"
                                    >
                                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap font-mono">
                                            {row.time_usec
                                                ? new Date(
                                                    Number(row.time_usec) / 1000,
                                                ).toLocaleString()
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700 font-medium truncate max-w-[12rem]" title={row.host}>
                                            {row.host}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 truncate max-w-md">
                                            <div className="font-medium text-slate-800 truncate" title={row.title}>
                                                {row.title || "(no title)"}
                                            </div>
                                            <a
                                                href={row.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-indigo-500 truncate hover:underline block"
                                                title={row.url}
                                            >
                                                {row.url}
                                            </a>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border border-slate-200 bg-slate-50 text-slate-600 rounded-sm"
                                            >
                                                {row.pred_topic || "other"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </section>
    )
}