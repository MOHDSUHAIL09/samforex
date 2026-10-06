// InvestTokenHistory.jsx
import React, { useState, useEffect } from "react";
import CustomTable from "../../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../../Componenets/ui/pagination/Pagination";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from "../../../api/apiClient";

const InvestTokenHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("running");

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Get regno from sessionStorage
    const regno = sessionStorage.getItem('Regno') || 1;

    // Format amount function
    const formatAmount = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

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

    // Fetch Token Mining History
    const fetchTokenHistory = async (type = "running") => {
        if (!regno) {
            toast.error('Registration number not found');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
// ✅ New apiClient
const response = await apiClient.get('/Token/TokenMiningHistoryAsync', {
    params: { regno, type }
}); 
const data = response.data;

            if (data.result === "true" || data.result === true) {
                const historyData = data.data || [];
                setRecords(historyData);
                // if (historyData.length === 0) {
                //     toast.info(`No ${type} investments found`);
                // }
            } else {
                toast.error(data.message || 'Failed to fetch history');
                setRecords([]);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
            toast.error(err.message || 'Something went wrong');
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTokenHistory(activeTab);
    }, [activeTab]);

    // Filter records based on search term
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.investtype?.toLowerCase().includes(searchLower)) ||
            (row.Rkprice?.toString().toLowerCase().includes(searchLower)) ||
            (row.RKbv?.toString().toLowerCase().includes(searchLower)) ||
            (row.remark?.toLowerCase().includes(searchLower)) ||
            (row.TranNO?.toLowerCase().includes(searchLower)) ||
            (row.epinNo?.toLowerCase().includes(searchLower))
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
        "Plan",
        "Amount",
        "Tokens",
        "Daily Percentage %",
        "Lock-up",
        "Status",
        "Remark",
    ];

    // Handle Tab Change
    const handleTabChange = (type) => {
        setActiveTab(type);
        setPageIndex(1);
    };

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="Table-container royalty-main-wrapper mb-5 p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <h3 className="mb-0 text-dark"> Token Mining History</h3>
                </div>

                {/* Tabs */}
                <div className="d-flex gap-2 mb-3 flex-wrap">
                    <button 
                        className={`btn ${activeTab === 'running' ? 'btn-warning' : 'btn-outline-secondary'}`}
                        onClick={() => handleTabChange('running')}
                    >
                         Running
                    </button>
                    <button 
                        className={`btn ${activeTab === 'completed' ? 'btn-success' : 'btn-outline-secondary'}`}
                        onClick={() => handleTabChange('completed')}
                    >
                         Completed
                    </button>
                    <button 
                        className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => handleTabChange('all')}
                    >
                         All
                    </button>
                </div>

                <div className="d-flex justify-content-between entries-search-bar entries-control mb-3">
                    <div className="entries-control">
                        <label className="text-dark">Show entries:</label>
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
                        {currentRecords.length > 0 ? (
                            currentRecords.map((row, index) => (
                                <tr key={row.Rid || index}>
                                    <td className="text-center">
                                        <div className="sr-no-circle">
                                            {startIndex + index + 1}
                                        </div>
                                    </td>
                                    <td>{formatDate(row.Rdate)}</td>
                                    <td>
                                        <span className="text-primary">
                                            {row.investtype || 'Tier'}
                                        </span>
                                    </td>
                                    <td style={{ color: "#10b981", fontWeight: "600" }}>
                                        {formatAmount(row.Rkprice)}
                                    </td>
                                    <td>{row.RKbv || 0}</td>
                                    <td style={{ color: "#10b981", fontWeight: "600" }}>
                                        {row.slabfine}
                                    </td>
                                    <td>
                                        <span className="text-primary">
                                            {row.booster || 0} Months
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${row.TranNO === 'Running' ? 'bg-warning' : 'bg-success'}`}>
                                            {row.TranNO === 'Running' ? ' Running' : ' Completed'}
                                        </span>
                                    </td>
                                    <td style={{ color: "#6b7280", fontSize: "13px", maxWidth: "200px", wordBreak: "break-word" }} title={row.remark || "-"}>
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
        </>
    );
};

export default InvestTokenHistory;