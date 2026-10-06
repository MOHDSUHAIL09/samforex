import { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";

const Fundtransferhistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const regno = sessionStorage.getItem("Regno") ;

    // Format amount function
    const formatAmount = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // ✅ Fetch Deposit Wallet Data - CORRECT
    useEffect(() => {
        const fetchDepositHistory = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // ✅ CORRECT: Use path parameter
                const res = await apiClient.get(
                    `/DepositReport/WalletReport/${regno}`
                );
                           
                if (res.data?.result === "true") {
                    // ✅ CORRECT: Data is in response.walletData
                  const data = res.data.response?.walletData || [];

// Sirf FUND TRANSFER data
const newData = data.filter(
  (item) => item.transType === "FUND TRANSFER"
);


setRecords(newData);
                } else {
                    console.warn("⚠️ API result is not true");
                    setRecords([]);
                    setError("No data found");
                }
            } catch (error) {
                console.error("❌ API Error:", error.response || error);
                setError(error.response?.data?.message || "Failed to fetch data");
                setRecords([]);
            } finally {
                setLoading(false);
            }
        };
        
        if (regno) {
            fetchDepositHistory();
        } else {
            console.warn("⚠️ No Regno found");
            setLoading(false);
        }
    }, [regno]);

    // Filter records based on search term
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.dt?.toLowerCase().includes(searchLower)) ||
            (row.transType?.toLowerCase().includes(searchLower)) ||
            (row.credit?.toString().toLowerCase().includes(searchLower)) ||
            (row.debit?.toString().toLowerCase().includes(searchLower)) ||
            (row.remark?.toLowerCase().includes(searchLower))
        );
    });

    // Pagination logic
    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (pageIndex - 1) * itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when search term or items per page changes
    useEffect(() => {
        setPageIndex(1);
    }, [searchTerm, itemsPerPage]);

    const columns = [
        "Sl.No.",
        "Date",
        "Transaction Type",
        "Credit",
        "Debit",
        "Remark",
    ];

    return (
        <div className="Table-container royalty-main-wrapper mb-5 p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                <h3 className="mb-0">Fund Transfer History</h3>
            </div>

            <div className="d-flex justify-content-between entries-search-bar entries-control mb-3">
                <div className="entries-control">
                    <label>Show entries:</label>
                    <select 
                        className="form-select" 
                        value={itemsPerPage} 
                        onChange={e => setItemsPerPage(Number(e.target.value))}
                    >
                        {[10, 25, 50, 75, 100].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div className="search-wrapper mt-3">
                    <input
                        className="form-control search-input"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="alert alert-danger mb-3">
                    <strong>Error:</strong> {error}
                </div>
            )}


            <div className="report-card">
                <CustomTable columns={columns} loading={loading}>
                    {currentRecords.length > 0 ? (
                        currentRecords.map((row, index) => (
                            <tr key={index}>
                                <td className="text-center">
                                    <div className="sr-no-circle">
                                        {startIndex + index + 1}
                                    </div>
                                </td>
                                <td>{row.dt || "-"}</td>
                                <td>
                                    <span className="badge bg-info">
                                        {row.transType || "-"}
                                    </span>
                                </td>
                                <td style={{ color: "#10b981", fontWeight: "600" }}>
                                    {row.credit > 0 ? formatAmount(row.credit) : "0.00"}
                                </td>
                                <td style={{ color: "#ef4444", fontWeight: "600" }}>
                                    {row.debit > 0 ? formatAmount(row.debit) : "0.00"}
                                </td>
                                <td style={{ 
                                    color: "#6b7280", 
                                    fontSize: "13px",
                                    wordBreak: "break-word"
                                }} 
                                title={row.remark || "-"}>
                                    {row.remark || "-"}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-4">
                                {loading ? "Loading..." : "No records found"}
                            </td>
                        </tr>
                    )}
                </CustomTable>

                {/* Pagination Component */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={pageIndex}
                        totalPages={totalPages}
                        totalRecords={totalItems}
                        onPageChange={setPageIndex}
                    />
                )}
            </div>
        </div>
    );
};

export default Fundtransferhistory;


