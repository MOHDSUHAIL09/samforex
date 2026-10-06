import React, { useState, useEffect } from 'react';
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";
import apiClient from '../../api/apiClient';
import { ExternalLink } from 'lucide-react'; // 🔴 icon ke liye

const FundDepositStatus = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0); // 🔴 server side total

    // Get regno from sessionStorage
    const regno = sessionStorage.getItem('Regno');

    // Format amount function
    const formatAmount = (amount) => {
        return `${parseFloat(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString;
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        } catch {
            return dateString;
        }
    };

    // Truncate remark
    const truncateRemark = (remark) => {
        if (!remark) return "-";
        return remark.length > 60 ? `${remark.substring(0, 60)}...` : remark;
    };

    // Truncate hash
    const truncateHash = (hash) => {
        if (!hash) return "-";
        if (hash.length <= 16) return hash;
        return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
    };

    // 🔴 NEW API - TopupWallet (server side pagination)
    useEffect(() => {
        const fetchTopupWallet = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!regno) {
                    setError("Regno not found. Please login again.");
                    setLoading(false);
                    return;
                }

                const response = await apiClient.get(
                    `/DepositReport/TopupWallet?regno=${regno}&type=deposit fund&pageSize=${itemsPerPage}&pageIndex=${pageIndex}`
                );

                if (response.data?.result === "true") {
                    const walletData = response.data?.response?.data || [];
                    const rowCount = response.data?.response?.rowCount || 0;
                    setRecords(walletData);
                    setTotalItems(rowCount);
                } else {
                    setRecords([]);
                    setTotalItems(0);
                    setError(response.data?.message || "No data found");
                }
            } catch (error) {
                console.error("API Error:", error);
                setError(error?.response?.data?.message || "Failed to fetch data");
                setRecords([]);
                setTotalItems(0);
            } finally {
                setLoading(false);
            }
        };

        fetchTopupWallet();
    }, [regno, pageIndex, itemsPerPage]);

    // Reset to first page when items per page changes
    useEffect(() => {
        setPageIndex(1);
    }, [itemsPerPage]);

    // Search ke liye client side filtering (current page data pe)
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.TransDate?.toLowerCase().includes(searchLower)) ||
            (row.transType?.toLowerCase().includes(searchLower)) ||
            (row.Remark?.toLowerCase().includes(searchLower)) ||
            (row.credit?.toString().toLowerCase().includes(searchLower)) ||
            (row.debit?.toString().toLowerCase().includes(searchLower)) ||
            (row.trCode?.toLowerCase().includes(searchLower))
        );
    });

    // Pagination (server side)
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (pageIndex - 1) * itemsPerPage;

    // 🔴 UPDATED COLUMNS
    const columns = [
        "Sl.No.",
        "Date",
        "Transaction Type",
        "Credit",
        "Debit",
        "Remark",
        "View Transaction"
    ];

    // Get transType badge color
    const getTransTypeBadge = (transType) => {
        const type = (transType || "").toLowerCase();
        if (type.includes("fund deposit")) {
            return "badge bg-success";
        } else if (type.includes("fund transfer")) {
            return "badge bg-warning";
        } else if (type.includes("trading")) {
            return "badge bg-info";
        } else if (type.includes("betting")) {
            return "badge bg-danger";
        } else if (type.includes("wining")) {
            return "badge bg-primary";
        } else {
            return "badge bg-secondary";
        }
    };

    // 🔴 BSC Scan URL handler
    const handleViewTransaction = (trCode) => {
        if (!trCode) return;
        const url = `https://bscscan.com/tx/${trCode}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="Table-container royalty-main-wrapper mb-5 p-4">
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

            <div className="report-card">
                <CustomTable columns={columns} loading={loading}>
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((row, index) => (
                            <tr key={row.ACID || index}>
                                <td className="text-center">
                                    <div className="sr-no-circle">
                                        {startIndex + index + 1}
                                    </div>
                                </td>
                                <td>{formatDate(row.TransDate)}</td>
                                <td>
                                    <span className={getTransTypeBadge(row.transType)}>
                                        {row.transType || "-"}
                                    </span>
                                </td>
                                <td style={{ color: "#10b981", fontWeight: "600" }}>
                                    {row.credit > 0 ? `$${formatAmount(row.credit)}` : "0.00"}
                                </td>
                                <td style={{ color: "#ef4444", fontWeight: "600" }}>
                                    {row.debit > 0 ? `$${formatAmount(row.debit)}` : "0.00"}
                                </td>
                                <td style={{ fontSize: '13px' }} title={row.Remark}>
                                    {truncateRemark(row.Remark)}
                                </td>
                                {/* 🔴 View Transaction - BSC Scan */}
                                <td className="text-center">
                                    {row.trCode ? (
                                        <button
                                            onClick={() => handleViewTransaction(row.trCode)}
                                            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                                            title={row.trCode}
                                            style={{
                                                fontSize: '12px',
                                                padding: '4px 10px',
                                                borderRadius: '20px'
                                            }}
                                        >
                                            <ExternalLink size={14} />
                                            <span>{truncateHash(row.trCode)}</span>
                                        </button>
                                    ) : (
                                        <span className="text-muted">-</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-4">
                                {loading ? (
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                ) : (
                                    error || "No records found"
                                )}
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

export default FundDepositStatus;