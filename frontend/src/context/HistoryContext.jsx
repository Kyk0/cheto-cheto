// src/context/HistoryContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import { getHistorySample, uploadHistoryFile } from "../api/historyApi";

const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadSample = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getHistorySample();
            setItems(data || []);
            return data;
        } catch (e) {
            setError(e.message || "Failed to load sample history");
            setItems([]);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const uploadHistory = useCallback(async (file, zipFile) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await uploadHistoryFile(file, zipFile);
            setItems(data || []);
            return data;
        } catch (e) {
            setError(e.message || "Failed to upload history");
            setItems([]);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const value = {
        items,
        isLoading,
        error,
        loadSample,
        uploadHistory,
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