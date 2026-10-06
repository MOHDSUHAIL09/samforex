// WithdrawReport.jsx - Exact copy of InvestmentHistory style
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";

const IncomePayOutHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const regno = sessionStorage.getItem("Regno");

    useEffect(() => {
        const fetchWithdrawReport = async () => {
            if (!regno) {
                setLoading(false);
                setError("Please login to view your withdrawal history");
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const res = await apiClient.get(
                    `/IncomePayout/PayoutReport/${regno}`
                );

                if (res.data && res.data.result === "true") {
                    const reportData = res.data.response || [];
                    setRecords(reportData);
                } else {
                    setRecords([]);
                    setError(res.data?.message || "Failed to fetch data");
                }
            } catch (error) {
                console.error("API Error:", error.response || error);
                setError(error.response?.data?.message || "An error occurred while fetching data");
                setRecords([]);
            } finally {
                setLoading(false);
            }
        };

        fetchWithdrawReport();
    }, [regno]);

    // Filter records
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.entryDate && row.entryDate.toLowerCase().includes(searchLower)) ||
            (row.remark && row.remark.toLowerCase().includes(searchLower)) ||
            (row.status && row.status.toLowerCase().includes(searchLower))
        );
    });

    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    const handlePageChange = (page) => setCurrentPage(page);
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return dateString;
    };

    const formatAmount = (amount) => {
        if (!amount && amount !== 0) return "-";
        return `$${Number(amount).toFixed(2)}`;
    };

    const getStatusBadge = (status) => {
        if (!status) return "secondary";
        const type = status.toLowerCase();
        if (type.includes('success') || type.includes('approved') || type.includes('completed')) return "success";
        if (type.includes('pending')) return "warning";
        if (type.includes('rejected') || type.includes('failed') || type.includes('cancel')) return "danger";
        return "secondary";
    };

    const columns = [
        "Sl.No.",
        "Date",
        "PayOut Amount",
        "Service charge",
        "Recivice Amount",
        "Remark",
        "Status"
    ];

    // Login required error
    if (error === "Please login to view your withdrawal history") {
        return (
            <div className="Table-container downline-main-wrapper report-container p-2 p-md-4 mb-5">
                <div className="mb-3">
                    <h2>Withdrawal Report</h2>
                </div>
                <div className="alert alert-warning shadow-sm rounded-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="Table-container downline-main-wrapper report-container p-2 p-md-4 mb-5">
                <div className="mb-3">
                    <h2>PayOut Report</h2>
                </div>
                <div className="alert alert-danger shadow-sm rounded-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="Table-container downline-main-wrapper report-container p-2 p-md-4 mb-5">
            {/* Heading */}
            <div className="mb-3">
                <h2>Income Payout History</h2>
            </div>

            {/* Search and Items per page */}
            <div className="entries-search-bar entries-control mb-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <label className="fw-semibold">Show entries:</label>
                        <select
                            className="form-select w-auto"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            style={{
                                borderRadius: "8px",
                                border: "1px solid rgba(102, 126, 234, 0.2)",
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={75}>75</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <input
                            className="form-control"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                minWidth: "250px",
                                borderRadius: "8px",
                                border: "1px solid rgba(102, 126, 234, 0.2)",
                                padding: "8px 12px",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <CustomTable columns={columns} loading={loading}>
                {currentRecords.length > 0 ? (
                    currentRecords.map((row, index) => (
                        <tr key={index}>
                            <td className="text-center">
                                <div className="sr-no-circle">
                                    {startIndex + index + 1}
                                </div>
                            </td>
                            <td>{row.TransDate ? new Date(row.TransDate).toLocaleString("en-GB") : "-"}</td>
                            <td>
                                {row.debit > 0 ? (
                                    <span className="badge bg-success px-3 py-2 rounded-pill">
                                        {formatAmount(row.debit)}
                                    </span>
                                ) : (
                                    <span className="text-muted">-</span>
                                )}
                            </td>
                            <td>
                                {row.handlingcharge > 0 ? (
                                    <span className="badge bg-danger px-3 py-2 rounded-pill">
                                        {formatAmount(row.handlingcharge)}
                                    </span>
                                ) : (
                                    <span className="text-muted">-</span>
                                )}
                            </td>
                            <td>
                                {row.netPayable > 0 ? (
                                    <span className="badge bg-primary px-3 py-2 rounded-pill">
                                        {formatAmount(row.netPayable)}
                                    </span>
                                ) : (
                                    <span className="text-muted">-</span>
                                )}
                            </td>
                            <td>
                                <span style={{ fontSize: '0.9rem' }}>
                                    {row.Remark || "-"}
                                </span>
                            </td>
                            <td>
                                <span className={`badge bg-${getStatusBadge(row.status)} px-3 py-2 rounded-pill`}>
                                    {row.status || "N/A"}
                                </span>
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

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={totalItems}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default IncomePayOutHistory;