const TOPIC_COLORS = {
    news: "#ef4444",
    shopping: "#f97316",
    social: "#ec4899",
    video: "#10b981",
    education: "#06b6d4",
    work: "#6366f1",
    finance: "#22c55e",
    travel: "#14b8a6",
    gaming: "#a855f7",
    entertainment: "#d946ef",
    tech: "#3b82f6",
    services: "#8b5cf6",
    health: "#84cc16",
    government: "#eab308",
    other: "#94a3b8",
}

function topicColor(topic) {
    return TOPIC_COLORS[topic] || TOPIC_COLORS.other
}

export function buildForceGraphData(items) {
    const hostMap = Object.create(null)
    const events = []

        ; (items || []).forEach(row => {
            const host = row.host
            if (!host) return

            const topic = row.pred_topic || "other"
            const probRaw = row.pred_prob
            const prob = probRaw ? Number(probRaw) : 0
            const url = row.url || ""
            const timeRaw = row.time_usec ?? null
            const t = timeRaw != null && Number.isFinite(Number(timeRaw))
                ? Number(timeRaw) / 1000
                : null

            let item = hostMap[host]
            if (!item) {
                item = hostMap[host] = {
                    host,
                    topic,
                    maxProb: prob,
                    urls: [],
                    count: 0,
                }
            }
            item.count += 1
            if (url && !item.urls.includes(url)) {
                item.urls.push(url)
            }
            if (prob > item.maxProb) {
                item.maxProb = prob
                item.topic = topic
            }

            if (t != null) {
                events.push({ host, t })
            }
        })

    const hosts = Object.values(hostMap)
    if (!hosts.length) {
        return { nodes: [], links: [], adjacency: new Map() }
    }

    const topicSet = new Set(hosts.map(h => h.topic || "other"))
    const topicsUsed = Array.from(topicSet).sort()

    const topicGroups = new Map()
    topicsUsed.forEach(t => topicGroups.set(t, []))
    hosts.forEach(h => {
        const t = h.topic || "other"
        topicGroups.get(t).push(h)
    })

    const topicStats = {}
    hosts.forEach(h => {
        const t = h.topic || "other"
        if (!topicStats[t]) {
            topicStats[t] = { hosts: 0, requests: 0 }
        }
        topicStats[t].hosts += 1
        topicStats[t].requests += h.count
    })

    const counts = hosts.map(h => h.count)
    let minCount = Math.min(...counts)
    let maxCount = Math.max(...counts)
    if (!Number.isFinite(minCount) || !Number.isFinite(maxCount)) {
        minCount = 1
        maxCount = 1
    }

    const MIN_RADIUS = 12
    const MAX_RADIUS = 60
    function radiusForCount(c) {
        if (maxCount === minCount) return (MIN_RADIUS + MAX_RADIUS) / 2
        const t = (c - minCount) / (maxCount - minCount)
        return MIN_RADIUS + t * (MAX_RADIUS - MIN_RADIUS)
    }

    const topicReqValues = Object.values(topicStats).map(s => s.requests || 0)
    let minReq = Math.min(...topicReqValues)
    let maxReq = Math.max(...topicReqValues)
    if (!Number.isFinite(minReq) || !Number.isFinite(maxReq)) {
        minReq = 1
        maxReq = 1
    }

    const HUB_MIN_RADIUS = 30
    const HUB_MAX_RADIUS = 80
    function hubRadiusForTopic(topic) {
        const req = topicStats[topic]?.requests ?? 0
        if (maxReq === minReq) return (HUB_MIN_RADIUS + HUB_MAX_RADIUS) / 2
        const t = (req - minReq) / (maxReq - minReq)
        return HUB_MIN_RADIUS + t * (HUB_MAX_RADIUS - HUB_MIN_RADIUS)
    }

    const nodes = []
    const adjacency = new Map()

    function addAdj(a, b) {
        if (!adjacency.has(a)) adjacency.set(a, new Set())
        if (!adjacency.has(b)) adjacency.set(b, new Set())
        adjacency.get(a).add(b)
        adjacency.get(b).add(a)
    }

    topicsUsed.forEach(topic => {
        if (topic === "other") return
        const id = `topic:${topic}`

        nodes.push({
            id,
            label: topic,
            topic,
            kind: "hub",
            count: topicStats[topic]?.requests ?? 0,
            radius: hubRadiusForTopic(topic),
            color: topicColor(topic),
        })
    })

    hosts.forEach(h => {
        const radius = radiusForCount(h.count)
        const rawLabel = h.host || ""
        const label =
            rawLabel.length > 40 ? rawLabel.slice(0, 37) + "..." : rawLabel

        nodes.push({
            id: h.host,
            label,
            topic: h.topic || "other",
            kind: "host",
            count: h.count,
            radius,
            color: topicColor(h.topic || "other"),
            urls: h.urls,
            maxProb: h.maxProb,
        })

        if (h.topic && h.topic !== "other") {
            const hubId = `topic:${h.topic}`
            addAdj(hubId, h.host)
        }
    })

    const edgesMap = new Map()
    const THIRTY_MIN = 30 * 60 * 1000

    const eventsWithTime = events.filter(e => e.t != null)
    if (eventsWithTime.length > 1) {
        eventsWithTime.sort((a, b) => a.t - b.t)
        const minT = eventsWithTime[0].t

        const sessions = new Map()
        eventsWithTime.forEach(ev => {
            const idx = Math.floor((ev.t - minT) / THIRTY_MIN)
            if (!sessions.has(idx)) sessions.set(idx, [])
            sessions.get(idx).push(ev)
        })

        sessions.forEach(sessionEvents => {
            if (sessionEvents.length < 2) return
            const uniqueHosts = Array.from(
                new Set(sessionEvents.map(e => e.host).filter(Boolean)),
            )
            uniqueHosts.sort()
            for (let i = 0; i < uniqueHosts.length; i += 1) {
                for (let j = i + 1; j < uniqueHosts.length; j += 1) {
                    const a = uniqueHosts[i]
                    const b = uniqueHosts[j]
                    const key = `${a}||${b}`
                    const existing = edgesMap.get(key)
                    if (existing) {
                        existing.weight += 1
                    } else {
                        edgesMap.set(key, { source: a, target: b, weight: 1 })
                    }
                }
            }
        })
    }

    let hostLinks = Array.from(edgesMap.values())
    if (hostLinks.length > 0) {
        hostLinks.sort((a, b) => b.weight - a.weight)

        const keep = Math.max(1, Math.ceil(hostLinks.length * 0.8))
        hostLinks = hostLinks.slice(0, keep)
    }

    const links = []

    hostLinks.forEach(e => {
        addAdj(e.source, e.target)
        const srcTopic = hostMap[e.source]?.topic || "other"
        const tgtTopic = hostMap[e.target]?.topic || "other"
        const same = srcTopic === tgtTopic && srcTopic !== "other"
        const color = same ? topicColor(srcTopic) : "#64748b"

        links.push({
            source: e.source,
            target: e.target,
            kind: "session",
            weight: Math.min(e.weight, 12),
            color,
        })
    })

    topicsUsed.forEach(topic => {
        if (topic === "other") return
        const group = topicGroups.get(topic)
        if (!group || !group.length) return
        const hubId = `topic:${topic}`
        group.forEach(h => {
            addAdj(hubId, h.host)
            links.push({
                source: hubId,
                target: h.host,
                kind: "hub",
                weight: 4,
                color: topicColor(topic),
            })
        })
    })

    const hubIds = topicsUsed
        .filter(t => t !== "other")
        .map(t => `topic:${t}`)

    if (hubIds.length > 1) {
        for (let i = 0; i < hubIds.length; i += 1) {
            const a = hubIds[i]
            const b = hubIds[(i + 1) % hubIds.length]
            addAdj(a, b)
            links.push({
                source: a,
                target: b,
                kind: "topic",
                weight: 1,
                color: "#334155",
            })
        }
    }

    return { nodes, links, adjacency }
}