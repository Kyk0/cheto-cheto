import { useEffect, useMemo, useRef, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import * as d3 from "d3-force"
import { buildForceGraphData } from "./buildForceGraphData"

function getNodeId(n) {
    return typeof n === "object" ? n.id : n
}

export default function GraphCanvas({
    items,
    onNodeClick,
    searchQuery,
    onBackgroundClick,
}) {
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


        const charge = d3.forceManyBody().strength(-400)
        const forceX = d3.forceX(0).strength(0.08)
        const forceY = d3.forceY(0).strength(0.08)

        const link = d3
            .forceLink()
            .id(n => n.id)
            .distance(l => (l.kind === "hub" ? 160 : 100))
            .strength(l => (l.kind === "hub" ? 0.4 : 0.1))

        const collision = d3.forceCollide().radius(n => {
            const r = Number(n.radius) || 5
            return r * 2.0
        }).strength(0.8)

        fg.d3Force("charge", charge)
        fg.d3Force("link", link)
        fg.d3Force("collision", collision)
        fg.d3Force("center", null)
        fg.d3Force("x", forceX)
        fg.d3Force("y", forceY)

        fg.d3ReheatSimulation()

        hasFitRef.current = false
    }, [nodes, links])

    useEffect(() => {
        const fg = fgRef.current
        if (!fg) return
        if (!nodes.length) return

        const id = setTimeout(() => {
            if (!hasFitRef.current) {
                fg.zoomToFit(600, 100)
                hasFitRef.current = true
            }
        }, 800)

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

    function isNeighborNode(node) {
        if (!hoverNode || !highlightIds) return false
        return highlightIds.has(node.id) && node.id !== hoverNode.id
    }

    function isHighlightedLink(link) {
        if (!highlightIds) return true
        const sid = getNodeId(link.source)
        const tid = getNodeId(link.target)
        return highlightIds.has(sid) && highlightIds.has(tid)
    }

    // Search Logic
    function isSearchMatch(node) {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (node.label || "").toLowerCase().includes(q) ||
            (node.topic || "").toLowerCase().includes(q)
    }

    function nodeCanvasObject(node, ctx, globalScale) {
        if (
            !Number.isFinite(node.x) ||
            !Number.isFinite(node.y) ||
            !Number.isFinite(globalScale)
        ) {
            return
        }

        const isHovered = hoverNode && node.id === hoverNode.id
        const isNeighbor = isNeighborNode(node)
        const highlighted = isHighlightedNode(node)
        const matchesSearch = isSearchMatch(node)

        // Visibility Logic
        let alpha = 1
        if (searchQuery) {

            alpha = matchesSearch ? 1 : 0.1
        } else {

            alpha = highlighted ? 1 : 0.1
        }


        let baseRadius = Number(node.radius) || 5

        baseRadius = Math.max(6, Math.min(baseRadius, 25))


        if (isHovered) baseRadius *= 1.2
        if (isNeighbor) baseRadius *= 1.1

        const label = node.label || ""

        ctx.save()
        ctx.globalAlpha = alpha


        ctx.beginPath()
        ctx.fillStyle = node.color || "#6366f1"
        ctx.arc(node.x, node.y, baseRadius, 0, 2 * Math.PI)
        ctx.fill()


        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = (isHovered ? 3 : 1.5) / globalScale
        ctx.stroke()


        const fontSize = Math.max(4, baseRadius * 0.6)
        const screenFontSize = fontSize * globalScale


        const showLabel = isHovered || isNeighbor || (searchQuery && matchesSearch) || (screenFontSize > 5)

        if (showLabel && label) {
            ctx.font = `${isHovered ? "700" : "600"} ${fontSize}px system-ui, sans-serif`
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"


            ctx.strokeStyle = "rgba(0,0,0,0.8)"
            ctx.lineWidth = 3 / globalScale
            ctx.lineJoin = "round"

            const textY = node.y + baseRadius + (fontSize * 0.8)

            ctx.strokeText(label, node.x, textY)
            ctx.fillStyle = "#f1f5f9"
            ctx.fillText(label, node.x, textY)
        }

        ctx.restore()
    }

    function linkColor(link) {
        const srcId = getNodeId(link.source)
        const srcNode = typeof link.source === 'object' ? link.source : nodes.find(n => n.id === srcId)
        const base = srcNode?.color || "#94a3b8"

        if (searchQuery) {

            return "rgba(148,163,184,0.1)"
        }

        if (!highlightIds) return base
        return isHighlightedLink(link) ? base : "rgba(148,163,184,0.05)"
    }

    function linkWidth(link) {
        const core = link.kind === "hub" ? 1.0 : 0.5
        if (searchQuery) return 0.2
        if (!highlightIds) return core
        return isHighlightedLink(link) ? core + 1.0 : 0.1
    }

    function handleNodeHover(node) {
        setHoverNode(node || null)
    }

    function handleBgClick() {



    }

    if (!nodes.length) {
        return (
            <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                No hosts to display.
            </div>
        )
    }

    return (
        <div className="w-full h-full overflow-hidden">
            <ForceGraph2D
                ref={fgRef}
                graphData={{ nodes, links }}
                backgroundColor="rgba(0,0,0,0)"
                nodeId="id"
                nodeRelSize={4}
                nodeVal={node => Number(node.radius) || 5}
                nodeColor={node => node.color}
                nodeCanvasObject={nodeCanvasObject}
                linkColor={linkColor}
                linkWidth={linkWidth}
                linkDirectionalParticles={0}
                linkCurvature={0}
                onNodeHover={handleNodeHover}
                onNodeClick={onNodeClick}
                onBackgroundClick={onBackgroundClick}
                enableNodeDrag={true}

                cooldownTicks={Infinity}
                d3AlphaDecay={0.05}
                d3VelocityDecay={0.4}
                minZoom={0.1}
                maxZoom={8}
            />
        </div>
    )
}