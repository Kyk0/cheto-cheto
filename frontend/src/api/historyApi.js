

export async function getHistorySample() {
    const response = await fetch("http://localhost:8080/api/history-sample");

    if (!response.ok) {
        throw new Error(`Failed to load history sample: ${response.status}`);
    }

    return await response.json();
}


export async function uploadHistoryFile(file, zipFile) {
    if (!file && !zipFile) {
        throw new Error("No file selected");
    }

    const formData = new FormData();
    if (file) {
        formData.append("file", file);
    }
    if (zipFile) {
        formData.append("zip", zipFile);
    }

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