import React, { useState, useEffect } from "react";
import CustomTable from "../../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../../Componenets/ui/pagination/Pagination";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from "../../../api/apiClient";

const SocialTaskReport = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [transtype, setTranstype] = useState('All');

    // Get regno from sessionStorage
    const regno = sessionStorage.getItem('Regno');

    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Fetch Social Task Report Data
    const fetchSocialTaskReport = async () => {
        if (!regno) {
            toast.error('Registration number not found');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.get(
                `/Dashboard/SocialTaskReport?regno=${regno}&transtype=${transtype}&pageIndex=${pageIndex}&pageSize=${itemsPerPage}`);

            const data = response.data;
            console.log("API Response:", data);

            if (data.result === "true") {
                const historyData = data.response?.data || [];
                setRecords(historyData);
                setTotalRecords(data.response?.recordCount || 0);
            } else {
                toast.error(data.message || 'Failed to fetch report');
                setRecords([]);
                setTotalRecords(0);
            }
        } catch (err) {
            console.error('Error fetching report:', err);
            toast.error(err.message || 'Something went wrong');
            setRecords([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSocialTaskReport();
    }, [pageIndex, itemsPerPage, transtype]);

    // Filter records based on search term (local search)
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.AppName?.toLowerCase().includes(searchLower)) ||
            (row.Url?.toLowerCase().includes(searchLower)) ||
            (row.Percentage?.toString().toLowerCase().includes(searchLower)) ||
            (row.status?.toLowerCase().includes(searchLower)) ||
            (row.EntryDate?.toLowerCase().includes(searchLower))
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
    }, [searchTerm, itemsPerPage, transtype]);

    const columns = [
        "Sl.No.",
        "App Name",
        "URL Link",
        "Percentage",
        "Entry Date",
        "Status",
    ];

    // Get Status Badge
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return <span className="badge bg-success">✅ Completed</span>;
            case 'pending':
                return <span className="badge bg-warning text-dark"> Pending</span>;
            case 'failed':
                return <span className="badge bg-danger"> Failed</span>;
            default:
                return <span className="badge bg-secondary">{status || 'Pending'}</span>;
        }
    };

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="Table-container royalty-main-wrapper mb-5 p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <h3 className="mb-0 text-dark">Social Task Report</h3>
                </div>

                {/* Filters Row - Show entries and Search */}
                <div className="d-flex justify-content-between align-items-center mb-3 gap-3 entries-search-bar">
                    {/* Show Entries */}
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


                    {/* Search Records */}
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
                                <tr key={row.RowNumber || index}>
                                    <td className="text-center">
                                        <div className="sr-no-circle">
                                            {startIndex + index + 1}
                                        </div>
                                    </td>
                                    <td>
                                        <strong className="text-primary">{row.AppName || '-'}</strong>
                                    </td>
                                    <td>
                                        <a 
                                            href={row.Url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            style={{ 
                                                color: "#3b82f6", 
                                                textDecoration: "none",
                                                wordBreak: "break-all"
                                            }}
                                            onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                                            onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                                        >
                                            {row.Url?.length > 50 ? row.Url.substring(0, 50) + '...' : row.Url || '-'}
                                        </a>
                                    </td>
                                    <td style={{ color: "#10b981", fontWeight: "600" }}>
                                        {row.Percentage || 0}%
                                    </td>
                                    <td style={{ color: "#6b7280", fontSize: "13px" }}>
                                        {formatDate(row.EntryDate)}
                                    </td>
                                    <td>
                                        {getStatusBadge(row.status)}
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
        </>
    );
};

export default SocialTaskReport;