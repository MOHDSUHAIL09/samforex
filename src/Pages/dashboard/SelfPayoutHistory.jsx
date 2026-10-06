import React, { useState, useEffect } from "react";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from "../../api/apiClient";

const SeftradingHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);
    const [recordCount, setRecordCount] = useState(0);

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Get regno from sessionStorage
    const regno = sessionStorage.getItem('Regno');

    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '-';
        }
    };

    // Format Amount
    const formatAmount = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // ✅ Fetch Self Trading Payout History - FIXED with query params
    const fetchSelfTradingHistory = async () => {
        if (!regno) {
            toast.error('Registration number not found');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            
            // ✅ POST with query parameters
            const response = await apiClient.post(
                '/Trading/SelfTradingPayoutHistory',
                null, // No body
                {
                    params: {
                        regno: parseInt(regno),
                        pageNumber: pageIndex,
                        pageSize: itemsPerPage
                    }
                }
            );

            // ✅ Axios automatically parses JSON
            const data = response.data;
            if (data.result === "true" || data.result === true) {
                const historyData = data.response || data.data || [];
                setRecords(historyData);
                setRecordCount(historyData.length);
                
                // Calculate total amount
                const total = historyData.reduce((sum, item) => {
                    return sum + (parseFloat(item.payoutAmount) || parseFloat(item.Amount) || parseFloat(item.amount) || 0);
                }, 0);
                setTotalAmount(total);
            } else {
                toast.error(data.message || 'Failed to fetch history');
                setRecords([]);
                setTotalAmount(0);
                setRecordCount(0);
            }
        } catch (err) {
            console.error('Error fetching report:', err);
            
            const errorMessage = err.response?.data?.message || 
                                err.message || 
                                'Something went wrong';
            toast.error(errorMessage);
            setRecords([]);
            setTotalAmount(0);
            setRecordCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSelfTradingHistory();
    }, [pageIndex, itemsPerPage]);

    // Filter records based on search term
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.EntryDate?.toLowerCase().includes(searchLower)) ||
            (row.date?.toLowerCase().includes(searchLower)) ||
            (row.payoutDate?.toLowerCase().includes(searchLower)) ||
            (row.Amount?.toString().toLowerCase().includes(searchLower)) ||
            (row.payoutAmount?.toString().toLowerCase().includes(searchLower)) ||
            (row.amount?.toString().toLowerCase().includes(searchLower)) ||
            (row.remark?.toLowerCase().includes(searchLower)) ||
            (row.lcount?.toString().toLowerCase().includes(searchLower)) ||
            (row.status?.toLowerCase().includes(searchLower))
        );
    });

    // Pagination logic
    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (pageIndex - 1) * itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when search term changes
    useEffect(() => {
        setPageIndex(1);
    }, [searchTerm]);

    const columns = [
        "Sl.No.",
        "Date",
        "Payout Amount",
        "Remaining Amount",
        "Remark",
    ];

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="Table-container royalty-main-wrapper mb-5 p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <h3 className="mb-0 text-dark"> Self Trading Payout History</h3>
                    {/* {totalAmount > 0 && (
                        <div className="total-income-badge">
                            <span className="text-dark">Total Payout: </span>
                            <span style={{ color: "#10b981", fontWeight: "bold", fontSize: "18px" }}>
                                {formatAmount(totalAmount)}
                            </span>
                        </div>
                    )} */}
                </div>

                {/* Filters Row */}
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3 entries-search-bar">
                    <div className="entries-control d-flex align-items-center gap-2">
                        <label className="text-dark mb-0">Show entries:</label>
                        <select 
                            className="form-select" 
                            value={itemsPerPage} 
                            onChange={e => {
                                setItemsPerPage(Number(e.target.value));
                                setPageIndex(1);
                            }}
                            style={{ width: '80px' }}
                        >
                            {[10, 25, 50, 75, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>

                    <div className="search-wrapper">
                        <input
                            className="form-control search-input"
                            placeholder="🔍 Search records..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '250px' }}
                        />
                    </div>
                </div>

                <div className="report-card">
                    <CustomTable columns={columns} loading={loading}>
                        {currentRecords.length > 0 ? (
                            currentRecords.map((row, index) => (
                                <tr key={row.id || row.Rid || index}>
                                    <td className="text-center">
                                        <div className="sr-no-circle">
                                            {startIndex + index + 1}
                                        </div>
                                    </td>
                                    <td style={{ color: "#6b7280", fontSize: "13px" }}>
                                        {formatDate(row.EntryDate || row.date || row.payoutDate)}
                                    </td>
                                    <td style={{ color: "#10b981", fontWeight: "600" }}>
                                        {formatAmount(row.Amount || row.payoutAmount || row.amount || 0)}
                                    </td>
                                    <td style={{ color: "#8b5cf6", fontWeight: "600" }}>
                                        {formatAmount(row.lcount || row.remainingAmount || row.balance || 0)}
                                    </td>                       
                                    <td style={{ 
                                        color: "#6b7280", 
                                        fontSize: "13px", 
                                        maxWidth: "300px",
                                        wordBreak: "break-word"
                                    }} 
                                    title={row.remark || row.Remark || "-"}>
                                        {row.remark || row.Remark ? (
                                            (row.remark || row.Remark).length > 50 ? 
                                            (row.remark || row.Remark).substring(0, 50) + '...' : 
                                            (row.remark || row.Remark)
                                        ) : "-"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-4">
                                    {loading ? "⏳ Loading..." : "📭 No records found"}
                                </td>
                            </tr>
                        )}
                    </CustomTable>

                    {!loading && totalPages > 1 && (
                        <Pagination
                            currentPage={pageIndex}
                            totalPages={totalPages}
                            totalRecords={totalItems}
                            onPageChange={setPageIndex}
                        />
                    )}
                </div>
            </div>

            <style jsx>{`
                .sr-no-circle {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #f3f4f6;
                    color: #4b5563;
                    font-size: 13px;
                    font-weight: 600;
                }
                .total-income-badge {
                    background: #f0fdf4;
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid #bbf7d0;
                }
            `}</style>
        </>
    );
};

export default SeftradingHistory;