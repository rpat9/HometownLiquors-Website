import { useReport } from "../../contexts/ReportContext";
import { Download, Filter, FileText, BarChart3, Users, Calendar } from "lucide-react";

export default function Reports() {
    const {
        reportType,
        setReportType,
        dateRange,
        setDateRange,
        reportData,
        processReportData,
        generateReport,
        loading,
        formatLabel,
        formatDisplayValue
    } = useReport();

    const reportTypeOptions = [
        { value: "sales", label: "Sales Report", icon: FileText, description: "Order details and revenue" },
        { value: "products", label: "Product Performance", icon: BarChart3, description: "Product sales and performance" },
        { value: "customers", label: "Customer Analysis", icon: Users, description: "Customer orders and spending" },
    ];

    return (
        <div className="bg-[var(--card-bg)] p-6 space-y-6 rounded-xl shadow border border-[var(--color-border)]">

        <h2 className="text-2xl font-bold mb-4">Generate Reports</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {reportTypeOptions.map((option) => {

                const Icon = option.icon;
                const active = reportType === option.value;

                return (
                    <div
                    key={option.value}
                    onClick={() => setReportType(option.value)}
                    className={`cursor-pointer border p-4 rounded-lg transition ${
                        active ? "border-[var(--color-primary)] bg-[var(--color-bg)]" : "border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                    }`}
                    >
                        <div className="flex items-center space-x-3">
                            <Icon className={`h-6 w-6 ${active ? "text-[var(--color-primary)]" : "text-gray-500"}`} />
                            <div>
                                <p className={`font-medium ${active ? "text-[var(--color-primary)]" : "text-[var(--color-text)]"}`}>{option.label}</p>
                                <p className="text-sm text-gray-500">{option.description}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="text-sm text-[var(--color-text)] pr-2">Start Date</label>
                <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                    className="input p-2 border border-[var(--color-border)] rounded-md"
                />
            </div>
            <div>
                <label className="text-sm text-[var(--color-text)] pr-2">End Date</label>
                <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                    className="input p-2 border border-[var(--color-border)] rounded-md"
                />
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
            <button
            onClick={processReportData}
            disabled={loading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
                <Filter className="w-4 h-4" />
                {loading ? "Loading..." : "Generate Preview"}
            </button>

            <button
            onClick={generateReport}
            disabled={!reportData || loading}
            className="btn-primary bg-green-600 hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            >
                <Download className="w-4 h-4" />
                Export to PDF
            </button>
        </div>

            {reportData && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">Report Preview</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                        {Object.entries(reportData.summary).map(([key, value]) => {
                            const label = formatLabel(key);
                            const display = formatDisplayValue(key, value);

                            return (
                                <div key={key} className="bg-[var(--color-bg)] border border-[var(--color-border)] p-4 rounded-lg">
                                    <p className="text-sm text-[var(--color-muted)]">{label}</p>
                                    <p className="text-xl font-bold text-[var(--color-text)]">{display}</p>
                                </div>
                            );

                        })}

                    </div>

                    <div className="overflow-x-auto border rounded-lg border-[var(--color-border)]">
                        <table className="min-w-full table-auto text-sm">

                            <thead className="bg-[var(--color-bg)]">
                                <tr>
                                    {reportData.headers.map((head, idx) => (
                                        <th key={idx} className="p-3 text-left text-[var(--color-muted)]">{head}</th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {reportData.rows.slice(0, 10).map((row, idx) => (
                                    <tr key={idx} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg)]">
                                        {row.map((cell, i) => (
                                        <td key={i} className="p-3 text-[var(--color-text)]">{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>

                        </table>

                        {reportData.rows.length > 10 && (
                            <div className="p-3 text-sm text-[var(--color-muted)]">
                                Showing first 10 of {reportData.rows.length} rows. PDF will contain all records.
                            </div>
                        )}
                    </div>
                </div>
            )}
            
        </div>
    );
}