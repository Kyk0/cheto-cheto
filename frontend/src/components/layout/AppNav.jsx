import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

export default function AppNav() {
    return (
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 transition-all">
            <Link
                to="/"
                className="flex items-center gap-2 font-bold text-slate-900 hover:text-indigo-600 transition-colors"
            >
                <div className="bg-indigo-50 p-1.5 rounded-lg">
                    <Activity className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="tracking-tight text-lg">MyCoolHistory</span>
            </Link>

            <nav className="flex items-center gap-6">
                <Link to="/explore" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    Explore
                </Link>
                <Link to="/load" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    Upload
                </Link>
            </nav>
        </header>
    );
}