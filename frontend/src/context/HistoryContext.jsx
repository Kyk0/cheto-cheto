import { createContext, useContext, useState } from "react"
import { getHistorySample } from "../api/historyApi"

const HistoryContext = createContext(null)

export function HistoryProvider({ children }) {
    const [items, setItems] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    async function loadSample() {
        setIsLoading(true)
        setError(null)
        try {
            const data = await getHistorySample()
            setItems(data)
        } catch (err) {
            setError(err.message || "Can't load sample data")
        } finally {
            setIsLoading(false)
        }
    }

    const value = { items, isLoading, error, loadSample }

    return (
        <HistoryContext.Provider value={value}>
            {children}
        </HistoryContext.Provider>
    )
}

export function useHistory() {
    const ctx = useContext(HistoryContext)
    if (!ctx) {
        throw new Error("useHistory must be used inside HistoryProvider")
    }
    return ctx
}