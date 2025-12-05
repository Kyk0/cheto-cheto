import GraphCanvas from "../../lib/graph/GraphCanvas"

export default function GraphView({ items }) {
    return (
        <section className="w-full max-w-6xl mx-auto flex flex-col gap-3">
            <div className="text-xs text-slate-400">
                Obsidian-like host graph with topics as hubs. Hover a node to highlight its
                neighborhood.
            </div>
            <GraphCanvas items={items} />
        </section>
    )
}