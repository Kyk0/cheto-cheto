import { useMemo } from "react"

export default function StatsView({ items }) {
    const totalItems = items?.length ?? 0

    // --- 0. Pre-process Items with Time ---
    const cleanItems = useMemo(() => {
        if (!items) return []
        return items
            .map(i => {
                let t = 0
                // Handle various time formats
                if (i.time_usec) t = Number(i.time_usec) / 1000
                else if (i.time) t = Number(i.time)

                // Sanity check for reasonable year (e.g. > 1990) to filter bad data
                // 631152000000 is roughly year 1990
                if (t < 631152000000) t = 0

                return { ...i, t }
            })
            .filter(i => i.t && Number.isFinite(i.t))
            .sort((a, b) => a.t - b.t)
    }, [items])

    // --- 1. Basic Counts & Time Range ---
    const { hostCounts, topicCounts, timeRange } = useMemo(() => {
        const hCounts = {}
        const tCounts = {}

        if (!items) return { hostCounts: {}, topicCounts: {}, timeRange: null }

        // Use original items for counts to include those without time
        for (const row of items) {
            const host = row.host || "(unknown)"
            hCounts[host] = (hCounts[host] || 0) + 1

            const topic = row.pred_topic || "other"
            tCounts[topic] = (tCounts[topic] || 0) + 1
        }

        // Use cleanItems for time range
        let minTime = Infinity
        let maxTime = -Infinity

        if (cleanItems.length > 0) {
            minTime = cleanItems[0].t
            maxTime = cleanItems[cleanItems.length - 1].t
        }

        return {
            hostCounts: hCounts,
            topicCounts: tCounts,
            timeRange:
                minTime !== Infinity && maxTime !== -Infinity
                    ? { start: new Date(minTime), end: new Date(maxTime) }
                    : null,
        }
    }, [items, cleanItems])

    const uniqueHosts = Object.keys(hostCounts).length
    const uniqueTopics = Object.keys(topicCounts).length

    // --- 2. Session & Day Metrics ---
    const { sessionStats, dayStats } = useMemo(() => {
        if (!cleanItems.length) return { sessionStats: {}, dayStats: {} }

        // Sessions (30 min gap)
        let sessions = 0
        let currentSessionSize = 0
        let maxSessionSize = 0
        let totalSessionSize = 0
        let lastTime = 0

        // Days
        const days = {}

        cleanItems.forEach((item, idx) => {
            const date = new Date(item.t)
            const dayKey = date.toLocaleDateString()

            // Day stats
            days[dayKey] = (days[dayKey] || 0) + 1

            // Session stats
            if (idx === 0) {
                sessions = 1
                currentSessionSize = 1
            } else {
                const gap = (item.t - lastTime) / 1000 / 60 // minutes
                if (gap > 30) {
                    sessions++
                    if (currentSessionSize > maxSessionSize)
                        maxSessionSize = currentSessionSize
                    totalSessionSize += currentSessionSize
                    currentSessionSize = 1
                } else {
                    currentSessionSize++
                }
            }
            lastTime = item.t
        })
        // Final session check
        if (currentSessionSize > maxSessionSize) maxSessionSize = currentSessionSize
        totalSessionSize += currentSessionSize

        // Day aggregation
        const activeDays = Object.keys(days).length
        const dayCounts = Object.values(days)
        const avgPerDay =
            activeDays > 0
                ? Math.round(dayCounts.reduce((a, b) => a + b, 0) / activeDays)
                : 0
        const busiestDayEntry = Object.entries(days).sort((a, b) => b[1] - a[1])[0]
        const quietestDayEntry = Object.entries(days).sort((a, b) => a[1] - b[1])[0]

        return {
            sessionStats: {
                count: sessions,
                avgSize: sessions ? Math.round(totalSessionSize / sessions) : 0,
                maxSize: maxSessionSize,
            },
            dayStats: {
                activeDays,
                avgPerDay,
                busiest: busiestDayEntry,
                quietest: quietestDayEntry,
            },
        }
    }, [cleanItems])

    // --- 3. Top Lists ---
    const topHosts = useMemo(() => {
        return Object.entries(hostCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
    }, [hostCounts])

    const allTopics = useMemo(() => {
        return Object.entries(topicCounts)
            .sort((a, b) => b[1] - a[1])
    }, [topicCounts])

    // --- 4. Activity Graph (Hourly) ---
    const timeStats = useMemo(() => {
        if (!cleanItems.length) return []
        const hours = new Array(24).fill(0)

        cleanItems.forEach(item => {
            const date = new Date(item.t)
            const h = date.getHours()
            if (h >= 0 && h < 24) {
                hours[h]++
            }
        })

        const max = Math.max(...hours)
        return hours.map((count, i) => ({
            hour: i,
            count,
            height: max ? (count / max) * 100 : 0,
        }))
    }, [cleanItems])

    // --- Formatters ---
    const fmtDate = d => d?.toLocaleDateString() ?? "-"

    return (
        <section className="w-full max-w-6xl space-y-8 pb-12">
            {/* 1. Quick Summary */}
            <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-xl">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                    History Overview
                </h2>
                <p className="text-slate-500 leading-relaxed">
                    You have processed <strong className="text-slate-900">{totalItems.toLocaleString()}</strong> history records
                    across <strong className="text-slate-900">{uniqueHosts.toLocaleString()}</strong> unique websites,
                    covering <strong className="text-slate-900">{uniqueTopics}</strong> distinct topics.
                    Your data spans from <strong>{fmtDate(timeRange?.start)}</strong> to <strong>{fmtDate(timeRange?.end)}</strong>.
                </p>
            </div>

            {/* 2. Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Records" value={totalItems.toLocaleString()} />
                <MetricCard label="Unique Hosts" value={uniqueHosts.toLocaleString()} />
                <MetricCard label="Active Days" value={dayStats?.activeDays || 0} />
                <MetricCard label="Avg Records/Day" value={dayStats?.avgPerDay || 0} />

                <MetricCard label="Total Sessions" value={sessionStats?.count || 0} sub="30-min gaps" />
                <MetricCard label="Avg Session Size" value={sessionStats?.avgSize || 0} sub="records" />
                <MetricCard label="Largest Session" value={sessionStats?.maxSize || 0} sub="records" />
                <MetricCard label="Detected Topics" value={uniqueTopics} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 3. Top Topics */}
                <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-xl">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Topic Distribution
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {allTopics.map(([topic, count]) => (
                            <div key={topic}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-700 capitalize">{topic}</span>
                                    <span className="text-slate-400">{Math.round((count / totalItems) * 100)}% ({count})</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 w-full overflow-hidden rounded-full">
                                    <div
                                        className="h-full bg-indigo-500"
                                        style={{ width: `${(count / totalItems) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Top Websites */}
                <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-xl">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        Top Websites
                    </h3>
                    <div className="space-y-3">
                        {topHosts.map(([host, count], idx) => (
                            <div key={host} className="flex items-center gap-3 text-sm border-b border-slate-100 pb-2 last:border-0 hover:bg-orange-50 p-1 rounded transition-colors">
                                <div className="w-6 text-slate-400 font-mono text-xs text-right">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 flex justify-between">
                                    <span className="font-medium text-slate-700 truncate max-w-[200px]">
                                        {host}
                                    </span>
                                    <span className="text-slate-400 font-mono text-xs">
                                        {count.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. Day-Level Summary & Graph */}
            <div className="bg-white border border-slate-200 p-6 shadow-sm rounded-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Activity Patterns
                    </h3>
                    <div className="text-xs text-slate-500 max-w-md text-right">
                        Your busiest day was <strong className="text-slate-700">{dayStats?.busiest?.[0] || "-"}</strong> with {dayStats?.busiest?.[1] || 0} records.
                        The quietest was <strong>{dayStats?.quietest?.[0] || "-"}</strong>.
                    </div>
                </div>

                <div className="h-40 flex gap-1 border-b border-slate-100 pb-1">
                    {timeStats.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                            <div
                                className="w-full bg-emerald-200 hover:bg-emerald-500 transition-all rounded-t-sm"
                                style={{ height: `${Math.max(d.height, 5)}%` }}
                            ></div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 shadow-xl">
                                {d.hour}:00 — {d.count} visits
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-mono uppercase">
                    <span>12 AM</span>
                    <span>6 AM</span>
                    <span>12 PM</span>
                    <span>6 PM</span>
                    <span>11 PM</span>
                </div>
            </div>
        </section>
    )
}

function MetricCard({ label, value, sub }) {
    return (
        <div className="bg-white border border-slate-200 p-4 shadow-sm rounded-xl flex flex-col justify-between hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-default">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                {label}
            </div>
            <div className="mt-2">
                <span className="text-2xl font-bold text-slate-900">{value}</span>
                {sub && <span className="text-xs text-slate-500 ml-1">{sub}</span>}
            </div>
        </div>
    )
}