import { useEffect, useMemo, useRef, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import * as d3 from "d3-force"
import { buildForceGraphData } from "./buildForceGraphData"

function getNodeId(n) {
    return typeof n === "object" ? n.id : n
}

export default function GraphCanvas({ items }) {
    const { nodes, links, adjacency } = useMemo(
        () => buildForceGraphData(items),
        [items],
    )

    const fgRef = useRef(null)
    const [hoverNode, setHoverNode] = useState(null)
    const hasFitRef = useRef(false)

    useEffect(() => {
        const fg = fgRef.current
        if (!fg) return
        if (!nodes.length) return

        const charge = d3.forceManyBody().strength(-25)

        const link = d3
            .forceLink()
            .id(n => n.id)
            .distance(l => (l.kind === "hub" ? 65 : 45))
            .strength(l => (l.kind === "hub" ? 1.05 : 1))

        const collision = d3.forceCollide().radius(n => {
            const r = Number(n.radius) || 10
            return n.kind === "hub" ? r * 2.1 : r * 1.8
        })

        fg.d3Force("charge", charge)
        fg.d3Force("link", link)
        fg.d3Force("collision", collision)
        fg.d3Force("center", d3.forceCenter(0, 0))

        hasFitRef.current = false
    }, [nodes, links])

    useEffect(() => {
        const fg = fgRef.current
        if (!fg) return
        if (!nodes.length) return

        const id = setTimeout(() => {
            if (!hasFitRef.current) {
                fg.zoomToFit(400, 60)
                hasFitRef.current = true
            }
        }, 300)

        return () => clearTimeout(id)
    }, [nodes])

    const highlightIds = useMemo(() => {
        if (!hoverNode) return null
        const set = new Set()
        const id = hoverNode.id
        set.add(id)
        const neighbors = adjacency.get(id)
        if (neighbors) {
            neighbors.forEach(n => set.add(n))
        }
        return set
    }, [hoverNode, adjacency])

    function isHighlightedNode(node) {
        if (!highlightIds) return true
        return highlightIds.has(node.id)
    }

    function isHighlightedLink(link) {
        if (!highlightIds) return true
        const sid = getNodeId(link.source)
        const tid = getNodeId(link.target)
        return highlightIds.has(sid) && highlightIds.has(tid)
    }

    function nodeCanvasObject(node, ctx, globalScale) {
        if (
            !Number.isFinite(node.x) ||
            !Number.isFinite(node.y) ||
            !Number.isFinite(globalScale)
        ) {
            return
        }

        const highlighted = isHighlightedNode(node)
        const alpha = highlighted ? 1 : 0.2
        const baseRadius = Number(node.radius) || 10
        const label = node.label || ""

        const scale = Math.min(globalScale, 4)
        const fontSize =
            node.kind === "hub"
                ? Math.max(10, baseRadius * 0.9 * scale * 0.25)
                : Math.max(8, baseRadius * 0.7 * scale * 0.25)

        ctx.save()
        ctx.globalAlpha = alpha

        const innerR = baseRadius
        const glowR = baseRadius * 2.4

        const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            innerR * 0.1,
            node.x,
            node.y,
            glowR,
        )
        gradient.addColorStop(0, node.color || "#38bdf8")
        gradient.addColorStop(1, "rgba(15,23,42,0)")

        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(node.x, node.y, glowR, 0, 2 * Math.PI)
        ctx.fill()

        ctx.beginPath()
        ctx.fillStyle = node.color || "#38bdf8"
        ctx.strokeStyle = "#020617"
        ctx.lineWidth = highlighted ? 2.4 : 1.8
        ctx.arc(node.x, node.y, innerR, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()

        if (label) {
            ctx.font = `${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`
            ctx.textAlign = "center"
            ctx.textBaseline = "top"
            ctx.fillStyle = "rgba(226,232,240,0.94)"
            ctx.strokeStyle = "rgba(15,23,42,0.85)"
            ctx.lineWidth = 3

            const textY = node.y + innerR + 6
            ctx.strokeText(label, node.x, textY)
            ctx.fillText(label, node.x, textY)
        }

        ctx.restore()
    }

    function linkColor(link) {
        const base = link.color || "#475569"
        if (!highlightIds) return base
        return isHighlightedLink(link) ? base : "rgba(51,65,85,0.16)"
    }

    function linkWidth(link) {
        const core =
            link.kind === "hub"
                ? 0.8
                : 0.4 + (Math.min(link.weight || 1, 10) / 10) * 1.8
        if (!highlightIds) return core
        return isHighlightedLink(link) ? core + 0.5 : 0.25
    }

    function handleNodeHover(node) {
        setHoverNode(node || null)
    }

    if (!nodes.length) {
        return (
            <div className="w-full h-[620px] bg-slate-950 border border-slate-800 flex items-center justify-center text-xs text-slate-400">
                No hosts to display.
            </div>
        )
    }

    return (
        <div className="w-full h-[620px] bg-slate-950 border border-slate-800">
            <ForceGraph2D
                ref={fgRef}
                graphData={{ nodes, links }}
                backgroundColor="#020617"
                nodeId="id"
                nodeRelSize={4}
                nodeVal={node => Number(node.radius) || 10}
                nodeColor={() => "#000000"}
                nodeCanvasObject={nodeCanvasObject}
                linkColor={linkColor}
                linkWidth={linkWidth}
                linkDirectionalParticles={0}
                linkCurvature={0}
                onNodeHover={handleNodeHover}
                enableNodeDrag={true}
                cooldownTicks={120}
            />
        </div>
    )
}