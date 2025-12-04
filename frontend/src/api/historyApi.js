

export async function getHistorySample() {
    const response = await fetch("http://localhost:8080/api/history-sample");

    if (!response.ok) {
        throw new Error("Failed to load history sample: ${response.status}");
    }

    return await response.json();
}