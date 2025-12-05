import { Link } from "react-router-dom"
import { ArrowRight, Activity } from "lucide-react"

export default function HomePage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 ring-1 ring-slate-200/50">
                <Activity className="w-12 h-12 text-indigo-600" />
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                mycoolhistory.app
            </h1>

            <p className="text-slate-600 max-w-lg mb-10 text-lg leading-relaxed font-light">
                A beautiful, private way to visualize your digital footprint.
                <span className="block mt-1 text-slate-500 text-base">No cloud uploads. Your data stays yours.</span>
            </p>

            <div className="flex gap-4">
                <Link
                    to="/load"
                    className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    Get Started <ArrowRight className="w-5 h-5" />
                </Link>
            </div>


        </div>
    )
}