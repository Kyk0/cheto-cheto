import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, ArrowRight, FileText, Database, Archive, Loader2 } from "lucide-react"
import { useHistory } from "../context/HistoryContext"
import AppNav from "../components/layout/AppNav"

export default function LoadPage() {
    const [file, setFile] = useState(null)
    const [localLoading, setLocalLoading] = useState(false)
    const navigate = useNavigate()
    const { uploadHistory, loadSample } = useHistory()

    const handleFileChange = e => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setLocalLoading(true)

        try {
            await uploadHistory(file)
            navigate("/explore")
        } catch (err) {
            console.error(err)
            alert("Upload failed. Please ensure the backend is running on port 8080.")
        } finally {
            setLocalLoading(false)
        }
    }

    const handleLoadSample = async () => {
        setLocalLoading(true)
        try {
            await loadSample()
            navigate("/explore")
        } catch (err) {
            console.error(err)
            alert("Error loading sample. Is the backend running?")
        } finally {
            setLocalLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <AppNav />
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Upload History</h2>
                            <p className="text-slate-500 text-sm mt-2">
                                Select your browser history file to begin.
                            </p>
                        </div>

                        <label
                            className={`
                            flex flex-col items-center justify-center w-full h-40
                            border-2 border-dashed rounded-xl cursor-pointer
                            transition-all duration-200 group
                            ${file
                                    ? "border-indigo-200 bg-indigo-50/50"
                                    : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
                                }
                        `}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload
                                    className={`w-8 h-8 mb-3 transition-colors ${file
                                        ? "text-indigo-500"
                                        : "text-slate-400 group-hover:text-indigo-500"
                                        }`}
                                />
                                <p className="mb-1 text-sm text-slate-600 font-medium">
                                    {file ? (
                                        <span className="text-indigo-600 font-semibold">
                                            File selected
                                        </span>
                                    ) : (
                                        <span>
                                            <span className="text-indigo-600">Click to upload</span> or
                                            drag &amp; drop
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-slate-400">.json, .db, .zip</p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".json,.db,.zip"
                            />
                        </label>

                        {file && (
                            <div className="mt-4 flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100">
                                    {file.name.endsWith(".db") ? (
                                        <Database className="w-4 h-4 text-indigo-500" />
                                    ) : file.name.endsWith(".zip") ? (
                                        <Archive className="w-4 h-4 text-indigo-500" />
                                    ) : (
                                        <FileText className="w-4 h-4 text-indigo-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={!file || localLoading}
                            className={`
                            mt-8 w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200/50
                            flex items-center justify-center gap-2
                            transition-all duration-200
                            ${!file || localLoading
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5"
                                }
                        `}
                        >
                            {localLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                                </>
                            ) : (
                                <>
                                    Visualize History <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <button
                                onClick={handleLoadSample}
                                disabled={localLoading}
                                className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1 mx-auto"
                            >
                                No file?{" "}
                                <span className="underline decoration-slate-300 underline-offset-2 hover:decoration-indigo-300">
                                    Load sample data
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}