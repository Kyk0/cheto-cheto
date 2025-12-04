

export async function getHistorySample() {
    const response = await fetch("http://localhost:8080/api/history-sample");

    if (!response.ok) {
        throw new Error("Failed to load history sample: ${response.status}");
    }

    return await response.json();
}


export async function uploadHistoryFile(file) {
    if (!file) {
        throw new Error("No file selected");
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8080/api/history/upload", {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to upload history");
    }

    return res.json();
}