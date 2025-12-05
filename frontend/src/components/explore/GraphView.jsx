import { useState } from "react"
import GraphCanvas from "../../lib/graph/GraphCanvas"
import NodeDetailsPanel from "./NodeDetailsPanel"

export default function GraphView({ items, onViewHistory }) {
    const [selectedNode, setSelectedNode] = useState(null)

    const handleNodeClick = node => {
        setSelectedNode(node)
    }
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <section className="w-full h-[450px] flex flex-col relative bg-white border border-slate-200 overflow-hidden shadow-sm rounded-xl">
            {/* Background Gradient - Removed for pure white */}
            {/* <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 opacity-50 pointer-events-none"></div> */}

            {/* Header / Search */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto">
                    <h2 className="text-slate-900 font-bold text-lg">
                        Network Graph
                    </h2>
                    <p className="text-slate-500 text-xs max-w-xs mt-1">
                        Interactive visualization. Search to filter.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="pointer-events-auto w-64 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search nodes..."
                        className="w-full pl-9 pr-4 py-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 shadow-sm transition-all"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative w-full h-full overflow-hidden">
                <GraphCanvas
                    items={items}
                    onNodeClick={setSelectedNode}
                    searchQuery={searchQuery}
                    onBackgroundClick={() => {
                        setSelectedNode(null)
                        setSearchQuery("")
                    }}
                />

                {/* Details Panel */}
                <NodeDetailsPanel
                    node={selectedNode}
                    onClose={() => setSelectedNode(null)}
                    onViewHistory={onViewHistory}
                />
            </div>
        </section>
    )
}