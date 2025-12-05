export default function HistoryView({ items }) {
    const totalItems = items?.length ?? 0;
    const preview = (items || []).slice(0, 10);

    return (
        <section className="border border-slate-200 bg-white px-4 py-3 w-full max-w-6xl">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
                History (placeholder)
            </h2>

            <p className="text-xs text-slate-600 mb-3">
                Total records: <span className="font-semibold">{totalItems}</span>.
            </p>

            <div className="text-xs text-slate-500 mb-2">
                This section will turn into a full history viewer with search and filters.
                For now it shows a small preview of the first entries.
            </div>

            {preview.length === 0 ? (
                <p className="text-xs text-slate-500">No data to display.</p>
            ) : (
                <ul className="text-xs text-slate-700 divide-y divide-slate-200">
                    {preview.map((row, idx) => (
                        <li key={idx} className="py-1.5 flex flex-col">
              <span className="text-slate-900 truncate">
                {row.title || row.url || "(no title)"}
              </span>
                            <span className="text-slate-500 truncate text-[11px]">
                {row.host || "(unknown host)"}
              </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}