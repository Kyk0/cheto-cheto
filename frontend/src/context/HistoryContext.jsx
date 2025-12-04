// src/context/HistoryContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import { fetchSampleHistory, uploadSafariHistory } from "../api/historyApi";

const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadSample = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchSampleHistory();
            setItems(data || []);
        } catch (e) {
            setError(e.message || "Failed to load sample history");
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const uploadUserHistory = useCallback(async (file) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await uploadSafariHistory(file);
            setItems(data || []);
        } catch (e) {
            setError(e.message || "Failed to upload history");
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const value = {
        items,
        isLoading,
        error,
        loadSample,
        uploadUserHistory,
    };

    return (
        <HistoryContext.Provider value={value}>
            {children}
        </HistoryContext.Provider>
    );
}

export function useHistory() {
    const ctx = useContext(HistoryContext);
    if (!ctx) {
        throw new Error("useHistory must be used inside HistoryProvider");
    }
    return ctx;
}

export default HistoryProvider;