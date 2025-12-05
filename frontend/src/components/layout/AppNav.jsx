import { Link } from "react-router-dom";

export default function AppNav() {
    return (
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6">
            <Link
                to="/"
                className="font-semibold tracking-wide text-slate-900 hover:text-slate-700"
            >
                mycoolhistory.app
            </Link>
            <div className="text-xs text-slate-500">
                Explore
            </div>
        </header>
    );
}