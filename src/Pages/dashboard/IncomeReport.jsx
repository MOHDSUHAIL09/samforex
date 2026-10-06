import { useState, useEffect, useRef } from "react";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from "../../api/apiClient";

const IncomeReport = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalCredit, setTotalCredit] = useState(0);
    const [incomeTypes, setIncomeTypes] = useState([]);
    const [selectedType, setSelectedType] = useState('All');
    const [isTypesLoaded, setIsTypesLoaded] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const hasFetchedRef = useRef(false);

    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const regno = sessionStorage.getItem('Regno');

    // Get type from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const typeFromUrl = params.get('type');

        if (typeFromUrl) {
            const decodedType = decodeURIComponent(typeFromUrl);
            setSelectedType(decodedType);
        } else {
            setSelectedType('All');
        }
    }, [location.search]);

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

    // Format Amount
    const formatAmount = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Fetch Income Types from API - NO FALLBACK
    const fetchIncomeTypes = async () => {
        try {
            const response = await apiClient.get(`/Dashboard/IncomeType/income`);
            const data = response.data;
            let types = ['All'];
            if (data.result === "true") {
                const typesData = data.response?.data || [];
                
                if (typesData.length > 0 && typesData[0].TransTypes) {
                    // Parse TransTypes from API
                    const apiTypes = typesData[0].TransTypes
                        .split(',')
                        .map(t => t.trim())
                        .filter(t => t !== '' && t !== 'All');                        
                    types = ['All', ...apiTypes];
                }
            }
            setIncomeTypes(types);
            setIsTypesLoaded(true);
            
        } catch (err) {
            console.error(' Error fetching income types:', err);
            setIncomeTypes(['All']);
            setIsTypesLoaded(true);
            toast.error('Failed to load income types');
        }
    };

    // Fetch Income Report Data
    const fetchIncomeReport = async () => {
        let transtype = selectedType;
        if (selectedType === 'All' || !selectedType) {
            transtype = 'All';
        }
        if (!regno) {
            toast.error('Registration number not found');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const encodedType = encodeURIComponent(transtype);
            const response = await apiClient.get(`/Dashboard/IncomeReport?regno=${regno}&transtype=${encodedType}&pageIndex=${pageIndex}&pageSize=${itemsPerPage}`);
            const data = response.data;

            if (data.result === "true") {
                const historyData = data.response?.data || [];
                setRecords(historyData);
                const total = historyData.reduce((sum, item) => {
                    return sum + (parseFloat(item.credit) || parseFloat(item.netPayable) || 0);
                }, 0);
                setTotalCredit(total);
            } else {
                toast.error(data.message || 'Failed to fetch report');
                setRecords([]);
                setTotalCredit(0);
            }
        } catch (err) {
            console.error('❌ Error fetching report:', err);
            toast.error(err.message || 'Something went wrong');
            setRecords([]);
            setTotalCredit(0);
        } finally {
            setLoading(false);
            setIsFirstLoad(false);
            hasFetchedRef.current = true;
        }
    };

    // Load income types on mount
    useEffect(() => {
        fetchIncomeTypes();
    }, []);

    // Fetch when type changes
    useEffect(() => {
        if (isTypesLoaded && selectedType && !hasFetchedRef.current) {
            fetchIncomeReport();
        } else if (isTypesLoaded && selectedType && !isFirstLoad) {
            fetchIncomeReport();
        }
    }, [selectedType, isTypesLoaded]);

    // Fetch when pagination changes
    useEffect(() => {
        if (isTypesLoaded && selectedType && hasFetchedRef.current) {
            fetchIncomeReport();
        }
    }, [pageIndex, itemsPerPage]);

    // Filter records
    const filteredRecords = records.filter((row) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (row.TransDate?.toLowerCase().includes(searchLower)) ||
            (row.credit?.toString().toLowerCase().includes(searchLower)) ||
            (row.debit?.toString().toLowerCase().includes(searchLower)) ||
            (row.transType?.toLowerCase().includes(searchLower)) ||
            (row.Remark?.toLowerCase().includes(searchLower)) ||
            (row.status?.toLowerCase().includes(searchLower))
        );
    });

    const totalItems = filteredRecords.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (pageIndex - 1) * itemsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

    // Reset page when search changes
    useEffect(() => {
        setPageIndex(1);
    }, [searchTerm]);

    const columns = [
        "Sl.No.",
        "Date",
        "Credit",
        "Debit",
        "Income Type",
        "Remark",
    ];

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="Table-container royalty-main-wrapper mb-5 p-4">

                {/* Heading with Type */}
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <h3 className="mb-0 text-dark">
                        Statement
                        {selectedType && selectedType !== 'All' && (
                            <span style={{
                                color: "#0d6efd",
                                fontSize: "20px",
                                fontWeight: "600",
                                marginLeft: "10px"
                            }}>
                                - {selectedType}
                            </span>
                        )}
                        {selectedType === 'All' && (
                            <span style={{
                                color: "#6c757d",
                                fontSize: "20px",
                                fontWeight: "500",
                                marginLeft: "10px"
                            }}>
                                - All Transactions
                            </span>
                        )}
                    </h3>
                    <div className="d-flex align-items-center gap-3">
                        <span className="fw-bold text-success">
                            Total: {formatAmount(totalCredit)}
                        </span>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3 entries-search-bar">

                    <div className="entries-control d-flex align-items-center gap-2">
                        <label className="text-dark mb-0">Income Type:</label>
                        <select
                            className="form-select"
                            value={selectedType}
                            onChange={e => {
                                const newType = e.target.value;
                                setSelectedType(newType);

                                if (newType === 'All') {
                                    navigate('/dashboard/IncomeReport');
                                } else {
                                    navigate(`/dashboard/IncomeReport?type=${encodeURIComponent(newType)}`);
                                }
                            }}
                            style={{ width: '220px' }}
                        >
                            {incomeTypes.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
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
                                <tr key={row.Payid || index}>
                                    <td className="text-center">
                                        <div className="sr-no-circle">
                                            {startIndex + index + 1}
                                        </div>
                                    </td>
                                    <td>
                                        {formatDate(row.TransDate)}
                                    </td>                               
                                    <td style={{ color: "#10b981", fontWeight: "600" }}>
                                        {row.credit > 0 ? formatAmount(row.credit) : '0.00'}
                                    </td>
                                          <td style={{ color: "#c90000", fontWeight: "600" }}>
                                        {row.debit > 0 ? formatAmount(row.debit) : '0.00'}
                                    </td>
                                    
                                    <td style={{ color: "#6b7280", fontSize: "13px", maxWidth: "300px" }} title={row.transType || "-"}>
                                        {row.transType?.length > 50 ? row.transType.substring(0, 50) + '...' : row.transType || "-"}
                                    </td>
                                    <td style={{ color: "#6b7280", fontSize: "13px", maxWidth: "300px" }} title={row.Remark || "-"}>
                                        {row.Remark?.length > 50 ? row.Remark.substring(0, 50) + '...' : row.Remark || "-"}
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
                                                No records found for <strong style={{ color: "#0d6efd" }}>"{selectedType || 'selected type'}"</strong>
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

export default IncomeReport;