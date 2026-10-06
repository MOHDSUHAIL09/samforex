import React, { useState, useEffect } from "react";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from "../../api/apiClient";

const TokenMiningIncomeHistory = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalIncome, setTotalIncome] = useState(0);
    const [incomeTypes, setIncomeTypes] = useState([]);
    const [selectedType, setSelectedType] = useState('all');
    const [isTypesLoaded, setIsTypesLoaded] = useState(false);

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Get regno from sessionStorage
    const regno = sessionStorage.getItem('Regno');

    // ✅ URL se type nikaalo on mount
    useEffect(() => {

        const params = new URLSearchParams(location.search);
        const typeFromUrl = params.get('type');
        if (typeFromUrl) {
            const decodedType = decodeURIComponent(typeFromUrl);
            setSelectedType(decodedType);
        } else {
            setSelectedType('all');
        }
    }, [location.search]);

    // ✅ Fetch Income Types from API - FIXED
    const fetchIncomeTypes = async () => {
        try {
            const response = await apiClient.get('/Token/AllMiningIncome');

            const data = response.data;
            if (data.result === "true" && data.data) {
                setIncomeTypes(data.data);
            } else {
                setIncomeTypes([]);
            }
        } catch (err) {
            console.error('❌ Error fetching income types:', err);
            toast.error('Failed to load income types');
            setIncomeTypes([]);
        } finally {
            setIsTypesLoaded(true);
        }
    };

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

    // ✅ Fetch Token Mining Income History - FIXED
    const fetchTokenMiningHistory = async () => {
        if (!regno) {
            toast.error('Registration number not found');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // ✅ Build URL with params
            let url = `/Token/TokenMiningIncomeHistoryAsync?regno=${regno}&pageIndex=${pageIndex}&pageSize=${itemsPerPage}`;

            if (selectedType) {
                url += `&type=${encodeURIComponent(selectedType)}`;
            }


            // ✅ USE apiClient - NOT fetch
            const response = await apiClient.get(url);

            const data = response.data;

            if (data.result === "true" || data.result === true) {
                // ✅ FIXED: data.data.data se access karo
                const historyData = data.data?.data || [];
                const totalRecords = data.data?.totalRecords || 0;

                // console.log("📊 Total Records:", totalRecords);

                setRecords(historyData);

                // Calculate total income
                const total = historyData.reduce((sum, item) => {
                    return sum + (parseFloat(item.mn_Amount) || parseFloat(item.amount) || 0);
                }, 0);
                setTotalIncome(total);
            } else {
                toast.error(data.message || 'Failed to fetch history');
                setRecords([]);
                setTotalIncome(0);
            }
        } catch (err) {
            console.error('❌ Error fetching history:', err);
            console.error('❌ Error Response:', err.response);

            const errorMsg = err.response?.data?.message || err.message || 'Something went wrong';
            toast.error(errorMsg);
            setRecords([]);
            setTotalIncome(0);
        } finally {
            setLoading(false);
        }
    };

    // Fetch income types on component mount
    useEffect(() => {
        fetchIncomeTypes();
    }, []);

    // ✅ Fetch history when dependencies change
    useEffect(() => {
        if (isTypesLoaded) {
            fetchTokenMiningHistory();
        }
    }, [pageIndex, itemsPerPage, selectedType, isTypesLoaded]);

    // Filter records based on search term
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.EntryDate?.toLowerCase().includes(searchLower)) ||
            (row.dt_DueDate?.toLowerCase().includes(searchLower)) ||
            (row.mn_Amount?.toString().toLowerCase().includes(searchLower)) ||
            (row.IncomeType?.toLowerCase().includes(searchLower)) ||
            (row.Remark?.toLowerCase().includes(searchLower)) ||
            (row.bt_Status?.toString().toLowerCase().includes(searchLower))
        );
    });

    // Pagination logic
    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (pageIndex - 1) * itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setPageIndex(1);
    }, [searchTerm, itemsPerPage, selectedType]);

    const columns = [
        "Sl.No.",
        "Date",
        "Income Type",
        "Credit",
        "Debit",
        "Remark",
    ];

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="Table-container royalty-main-wrapper mb-5 p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <h3 className="mb-0 text-dark">
                        Statement
                        {selectedType && selectedType !== 'all' && (
                            <span style={{
                                color: "#0d6efd",
                                fontSize: "20px",
                                fontWeight: "600",
                                marginLeft: "10px"
                            }}>
                                - {selectedType}
                            </span>
                        )}
                        {selectedType === 'all' && (
                            <span style={{
                                color: "#6c757d",
                                fontSize: "20px",
                                fontWeight: "500",
                                marginLeft: "10px"
                            }}>
                                - All Types
                            </span>
                        )}
                    </h3>
                </div>

                {/* Filters Row */}
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3 entries-search-bar">
                    {/* Income Type Filter */}
                    <div className="entries-control d-flex align-items-center gap-2">
                        <label className="text-dark mb-0">Income Type:</label>
                        <select
                            className="form-select"
                            value={selectedType}
                            onChange={e => {
                                const newType = e.target.value;
                                setSelectedType(newType);
                                setPageIndex(1);

                                if (newType === 'all') {
                                    navigate('/dashboard/TokenMiningIncomeHistory');
                                } else {
                                    navigate(`/dashboard/TokenMiningIncomeHistory?type=${encodeURIComponent(newType)}`);
                                }
                            }}
                            style={{ width: '220px' }}
                        >
                            <option value="all">All Types</option>
                            {incomeTypes.length > 0 ? (
                                incomeTypes.map((item, index) => (
                                    <option key={index} value={item.incometype}>
                                        {item.incometype}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Loading types...</option>
                            )}
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
                                <tr key={row.in_InsID || index}>
                                    <td className="text-center">
                                        <div className="sr-no-circle">
                                            {startIndex + index + 1}
                                        </div>
                                    </td>
                                    <td>
                                        {formatDate(row.EntryDate || row.dt_DueDate)}
                                    </td>
                                    <td style={{ color: "#6b7280", fontSize: "13px" }}>
                                        {row.IncomeType || "-"}
                                    </td>
                                    <td style={{ color: "#10b981", fontWeight: "600" }}>
                                        {formatAmount(row.mn_Amount || 0)}
                                    </td>
                                    <td style={{ color: "#c50404", fontWeight: "600" }}>
                                        {formatAmount(row.debit || 0)}
                                    </td>
                                    <td style={{ color: "#6b7280", fontSize: "13px" }} title={row.Remark || "-"}>
                                        {row.Remark || "-"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-4">
                                    {loading ? (
                                        <div className="d-flex justify-content-center">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ padding: "30px 0" }}>
                                            <i className="ti ti-database-off" style={{ fontSize: "40px", color: "#ccc", display: "block", marginBottom: "10px" }}></i>
                                            <div style={{ fontSize: "16px", color: "#6c757d" }}>
                                                No records found for <strong style={{ color: "#0d6efd" }}>"{selectedType === 'all' ? 'All Types' : selectedType}"</strong>
                                            </div>
                                            <div style={{ fontSize: "13px", color: "#999", marginTop: "5px" }}>
                                                Try selecting a different income type from the dropdown above
                                            </div>
                                        </div>
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

        </>
    );
};

export default TokenMiningIncomeHistory;