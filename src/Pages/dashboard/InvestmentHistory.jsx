
// // InvestmentHistory.jsx - Original style same rakha
// InvestmentHistory.jsx - Complete updated code with dynamic table fields map
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";

const InvestmentHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const regno = sessionStorage.getItem("Regno");

    useEffect(() => {
        const fetchWalletReport = async () => {
            if (!regno) {
                setLoading(false);
                setError("Please login to view your investment history");
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const res = await apiClient.get(
                    `/Dashboard/SelfTradingHistory/${regno}`
                );

                if (res.data && res.data.result === "true") {
                  const tradingHistoryData = res.data.response?.tradingHistory || [];
                    
                    setRecords(tradingHistoryData);
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

        fetchWalletReport();
    }, [regno]);

    //  Updated Filter Logic matching new response fields keys
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.Rdate && row.Rdate.toLowerCase().includes(searchLower)) ||
            (row.remark && row.remark.toLowerCase().includes(searchLower)) ||
            (row.Rkprice && row.Rkprice.toString().toLowerCase().includes(searchLower)) ||
            (row.slabfine && row.slabfine.toString().toLowerCase().includes(searchLower)) ||
            (row.BinaryBuffer && row.BinaryBuffer.toString().toLowerCase().includes(searchLower))
        );
    });

    // Pagination logic
    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, endIndex);

    // Reset to first page when search term or items per page changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, itemsPerPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Format clean readable dates from ISO string timestamps
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return dateString.split('T')[0]; // Splits time chunk off
    };

    const columns = [
        "Sl.No.",
        "Date",
        "Amount",
        "ROI",
        "Max Caping",
        "Remark"
    ];

    return (
        <div className="Table-container downline-main-wrapper report-container p-2 p-md-4 mb-5">
            {/* Heading */}
            <div className="mb-2 p-3">
                <h3>Investment History</h3>
            </div>

            {/* Entry Filter / Global Search layout grids */}
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

            {/* Table Implementation Mapping requested variables */}
            <CustomTable columns={columns} loading={loading}>
                {currentRecords.length > 0 ? (
                    currentRecords.map((row, index) => (
                        <tr key={index}>
                            <td className="text-center ">
                                <div className="sr-no-circle">
                                    {startIndex + index + 1}
                                </div>
                            </td>
                            <td style={{fontWeight: "500", whiteSpace: "nowrap"}}>{formatDate(row.Rdate)}</td>
                            <td>
                                <span className=" text-success px-3 py-2 rounded-pill" style={{fontWeight: "bold"}}>
                                    ${row.Rkprice || 0}
                                </span>
                            </td>
                            <td className="text-info  font-medium" style={{fontWeight: "bold"}}>{row.slabfine ?? "-"}</td>
                            <td>
                                <span className="text-success px-3 py-2 rounded-pill" style={{fontWeight: "bold"}}>
                                    {row.BinaryBuffer || 0}
                                </span>
                            </td>
                            <td>
                                <span style={{ fontSize: '0.9rem', fontWeight: '500',whiteSpace: "nowrap" }}>
                                    {row.remark || "-"}
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

            {/* Pagination controls footer */}
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

export default InvestmentHistory;
