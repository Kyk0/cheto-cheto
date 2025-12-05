import { useMemo } from "react";

export default function StatsView({ items }) {
    const totalItems = items?.length ?? 0;

    const hostCounts = useMemo(() => {
        const counts = {};
        if (!items) return counts;

        for (const row of items) {
            const host = row.host || "(unknown)";
            counts[host] = (counts[host] || 0) + 1;
        }

        return counts;
    }, [items]);

    const uniqueHosts = Object.keys(hostCounts).length;

    const topHosts = useMemo(() => {
        return Object.entries(hostCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [hostCounts]);

    return (
        <section className="border border-slate-200 bg-white px-4 py-3 w-full max-w-6xl">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Stats (placeholder)
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div className="border border-slate-200 px-3 py-2">
                    <div className="text-slate-500">Total records</div>
                    <div className="text-slate-900 font-semibold mt-1">
                        {totalItems}
                    </div>
                </div>
                <div className="border border-slate-200 px-3 py-2">
                    <div className="text-slate-500">Unique hosts</div>
                    <div className="text-slate-900 font-semibold mt-1">
                        {uniqueHosts}
                    </div>
                </div>
            </div>

            <div className="text-xs text-slate-500 mb-2">
                This section will later show richer analytics (activity over time,
                topics, paths). For now it shows a minimal summary based on the loaded data.
            </div>

            <div className="mt-2">
                <div className="text-xs font-semibold text-slate-900 mb-1">
                    Top 5 hosts
                </div>
                {topHosts.length === 0 ? (
                    <p className="text-xs text-slate-500">No data to display.</p>
                ) : (
                    <ul className="text-xs text-slate-700 space-y-1">
                        {topHosts.map(([host, count]) => (
                            <li key={host} className="flex justify-between">
                                <span className="truncate max-w-[70%]">{host}</span>
                                <span className="text-slate-500">{count} visits</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}