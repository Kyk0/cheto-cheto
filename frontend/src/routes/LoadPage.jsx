import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, ArrowRight, FileText, Database, Archive, Loader2 } from "lucide-react"
import { useHistory } from "../context/HistoryContext"
import AppNav from "../components/layout/AppNav"

export default function LoadPage() {
    const [file, setFile] = useState(null)
    const [zipFile, setZipFile] = useState(null)
    const [localLoading, setLocalLoading] = useState(false)
    const navigate = useNavigate()
    const { uploadHistory, loadSample } = useHistory()

    const handleFileChange = e => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleZipChange = e => {
        if (e.target.files && e.target.files[0]) {
            setZipFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file && !zipFile) return
        setLocalLoading(true)

        try {
            await uploadHistory(file, zipFile)
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


                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Safari History (DB)</label>
                            <label
                                className={`
                                flex flex-col items-center justify-center w-full h-32
                                border-2 border-dashed rounded-xl cursor-pointer
                                transition-all duration-200 group
                                ${file
                                        ? "border-indigo-200 bg-indigo-50/50"
                                        : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
                                    }
                            `}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Database
                                        className={`w-8 h-8 mb-3 transition-colors ${file
                                            ? "text-indigo-500"
                                            : "text-slate-400 group-hover:text-indigo-500"
                                            }`}
                                    />
                                    <p className="mb-1 text-sm text-slate-600 font-medium text-center">
                                        {file ? (
                                            <span className="text-indigo-600 font-semibold truncate max-w-[200px] block">
                                                {file.name}
                                            </span>
                                        ) : (
                                            <span>
                                                <span className="text-indigo-600">Click to upload DB</span>
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-400">.db</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".db"
                                />
                            </label>
                        </div>


                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Google Takeout (ZIP)</label>
                            <label
                                className={`
                                flex flex-col items-center justify-center w-full h-32
                                border-2 border-dashed rounded-xl cursor-pointer
                                transition-all duration-200 group
                                ${zipFile
                                        ? "border-indigo-200 bg-indigo-50/50"
                                        : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
                                    }
                            `}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Archive
                                        className={`w-8 h-8 mb-3 transition-colors ${zipFile
                                            ? "text-indigo-500"
                                            : "text-slate-400 group-hover:text-indigo-500"
                                            }`}
                                    />
                                    <p className="mb-1 text-sm text-slate-600 font-medium text-center">
                                        {zipFile ? (
                                            <span className="text-indigo-600 font-semibold truncate max-w-[200px] block">
                                                {zipFile.name}
                                            </span>
                                        ) : (
                                            <span>
                                                <span className="text-indigo-600">Click to upload ZIP</span>
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-400">.zip</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleZipChange}
                                    accept=".zip"
                                />
                            </label>
                        </div>


                        <button
                            onClick={handleUpload}
                            disabled={(!file && !zipFile) || localLoading}
                            className={`
                            mt-8 w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200/50
                            flex items-center justify-center gap-2
                            transition-all duration-200
                            ${(!file && !zipFile) || localLoading
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