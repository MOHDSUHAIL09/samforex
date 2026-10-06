import React, { useState, useEffect } from "react";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from "../../api/apiClient";

const SelfTradingHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalWin, setTotalWin] = useState(0);
    const [totalLoss, setTotalLoss] = useState(0);
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
                minute: '2-digit',
                second: '2-digit'
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

    // Format Currency Rate
    const formatRate = (rate) => {
        return parseFloat(rate || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    //  Fetch Self Trading History
    const fetchSelfTradingHistory = async () => {
        if (!regno) {
            toast.error('Registration number not found');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            
            const response = await apiClient.get('/Trading/BidReport', {
                params: {
                    regno: parseInt(regno),
                    PageIndex: pageIndex,
                    PageSize: itemsPerPage
                }
            });


            const data = response.data;

            if (data.result === "true" || data.result === true) {
                const historyData = data.response?.data || [];
                const totalRecords = data.response?.recordCount || 0;
                
                setRecords(historyData);
                setRecordCount(totalRecords);
                
                // Calculate totals
                let totalBet = 0;
                let winCount = 0;
                let lossCount = 0;
                
                historyData.forEach(item => {
                    totalBet += parseFloat(item.betAmount) || 0;
                    if (item.type?.toLowerCase() === 'win') winCount++;
                    if (item.type?.toLowerCase() === 'loss') lossCount++;
                });
                
                setTotalAmount(totalBet);
                setTotalWin(winCount);
                setTotalLoss(lossCount);
                
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
            (row.entryDate?.toLowerCase().includes(searchLower)) ||
            (row.endtime?.toLowerCase().includes(searchLower)) ||
            (row.betAmount?.toString().toLowerCase().includes(searchLower)) ||
            (row.currency?.toLowerCase().includes(searchLower)) ||
            (row.predict?.toLowerCase().includes(searchLower)) ||
            (row.type?.toLowerCase().includes(searchLower)) ||
            (row.remark?.toLowerCase().includes(searchLower)) ||
            (row.status?.toString().toLowerCase().includes(searchLower)) ||
            (row.unique_id?.toLowerCase().includes(searchLower)) ||
            (row.slot?.toString().toLowerCase().includes(searchLower))
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

    //  COLUMNS
    const columns = [
        "Sl.No.",
        "Date",
        "Currency",
        "Bet Amount",
        "Slot",
        "Prediction",
        "Buying Rate",
        "Selling Rate",
        "Result",
        "Remark",
    ];

    //  Get status badge - TYPE se check karo
    const getStatusBadge = (type) => {
        if (type?.toLowerCase() === 'win') {
            return <span className="badge bg-success"> Win</span>;
        } else if (type?.toLowerCase() === 'loss') {
            return <span className="badge bg-danger">Loss</span>;
        }
        return <span className="badge bg-secondary">-</span>;
    };

    //  Get prediction badge
    const getPredictionBadge = (predict) => {
        if (predict?.toLowerCase() === 'up') {
            return <span className="badge bg-success"> UP</span>;
        } else if (predict?.toLowerCase() === 'down') {
            return <span className="badge bg-danger"> DOWN</span>;
        }
        return <span className="badge bg-secondary">{predict || '-'}</span>;
    };

    //  Get slot display
    const getSlotDisplay = (slot) => {
        if (!slot) return '-';
        if (typeof slot === 'number') {
            return `${slot} min`;
        }
        return slot;
    };

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="Table-container royalty-main-wrapper mb-5 p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <h3 className="mb-0 text-dark">Self Trading History</h3>
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
                                <tr key={row.unique_id || row.id || index}>
                                    <td className="text-center">
                                        <div className="sr-no-circle">
                                            {startIndex + index + 1}
                                        </div>
                                    </td>
                                    <td style={{ color: "#6b7280", fontSize: "13px" }}>
                                        {formatDate(row.entryDate || row.endtime)}
                                    </td>
                                    <td>
                                        <span className="badge bg-info">
                                            {row.currency?.toUpperCase() || '-'}
                                        </span>
                                    </td>
                                    <td style={{ color: "#3b82f6", fontWeight: "600" }}>
                                        {formatAmount(row.betAmount || 0)}
                                    </td>
                                    <td>
                                        <span className="badge bg-warning text-dark">
                                             {getSlotDisplay(row.slot)}
                                        </span>
                                    </td>
                                    <td>
                                        {getPredictionBadge(row.predict)}
                                    </td>
                                       <td style={{ color: "#8b5cf6", fontWeight: "500" }}>
                                        ${formatRate(row.currencyRate)}
                                    </td>
                                    <td style={{ color: "#8b5cf6", fontWeight: "500" }}>
                                        ${formatRate(row.sellingRate)}
                                    </td>
                                    <td>
                                        {getStatusBadge(row.type)}  {/*  TYPE se check */}
                                    </td>
                                    <td style={{ 
                                        color: "#6b7280", 
                                        fontSize: "13px", 
                                        maxWidth: "300px",
                                        wordBreak: "break-word"
                                    }} 
                                    title={row.remark || "-"}>
                                        {row.remark ? (
                                            row.remark.length > 50 ? 
                                            row.remark.substring(0, 50) + '...' : 
                                            row.remark
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
        </>
    );
};

export default SelfTradingHistory;