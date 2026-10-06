import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../api/apiClient";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";

const DepositHistory = () => {
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation(); 
    

    // Pagination state
    const [pageIndex, setPageIndex] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [incomeTypes, setIncomeTypes] = useState([]);
    const [selectedType, setSelectedType] = useState("all");
    const [loading, setLoading] = useState(true);



    const regno = sessionStorage.getItem("Regno") || 1;

     useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const typeFromUrl = queryParams.get('type');
        
        if (typeFromUrl) {
            setSelectedType(typeFromUrl);
        }
    }, [location.search]); 

    // Format amount function
    const formatAmount = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

  



    useEffect(() => {
        const fetchIncomeTypes = async () => {
            try {
                setLoading(true);
                const res = await apiClient.get("/DepositReport/WalletIncomeType");

                if (res.data && res.data.result === "true") {
                    const typesData = res.data.response?.topupWalletType || [];
                    setIncomeTypes(typesData);
                } else {
                    setIncomeTypes([]);
                }
            } catch (error) {
                console.error(" Failed to load dropdown types metadata query:", error);
                setIncomeTypes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchIncomeTypes();
    }, []);

      useEffect(() => {
        const fetchDepositHistory = async () => {
            try {
                setLoading(true);
                setError(null);


                // ✅ CORRECT: Use path parameter
                let url = `/DepositReport/WalletReport/${regno}`;
                if (selectedType) {
                    url += `?type=${encodeURIComponent(selectedType)}`;
                }

                const res = await apiClient.get(url);

                if (res.data?.result === "true") {
                    const data = res.data.response?.walletData || [];

                    setRecords(data);
                } else {
                    console.warn("⚠️ API result is not true");
                    setRecords([]);
                    setError("No data found");
                }
            } catch (error) {
                console.error(" API Error:", error.response || error);
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
    }, [regno, selectedType]);

    // Dropdown change handler setup
    const handleChange = (e) => {
        const value = e.target.value;
        setSelectedType(value);
        setPageIndex(1); 
    };

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
                <h3 className="mb-4">Deposit History</h3>
            </div>

          <div className="row g-2 g-md-3  entries-search-bar mb-3">
    {/* Show entries */}
    <div className="col-12 col-sm-6 col-md-3 col-lg-auto entries-control">
        <div className="d-flex align-items-center gap-2">
            <label className="text-nowrap fw-semibold" style={{fontSize: "14px"}}>
                Show entries:
            </label>
            <select
                className="form-select form-select-sm"
                value={itemsPerPage}
                onChange={e => setItemsPerPage(Number(e.target.value))}
                style={{width: "auto", minWidth: "70px"}}
            >
                {[10, 25, 50, 75, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
        </div>
    </div>
    {/* Income Type */}
    <div className="col-12 col-sm-6 col-md-4 col-lg-auto">
        <div className="d-flex align-items-center gap-2">
            <label className="text-dark fw-semibold text-nowrap" style={{fontSize: "14px"}}>
                Income Type:
            </label>
            <select
                className="form-select form-select-sm"
                value={selectedType}
                onChange={handleChange}
                disabled={loading}
                style={{minWidth: "120px", width: "100%"}}
            >
                <option value="all">{loading ? "Loading types..." : "All"}</option>
                {!loading && incomeTypes.map((item, index) => (
                    <option key={index} value={item.transType}>
                        {item.transType}
                    </option>
                ))}
            </select>
        </div>
    </div>

    {/* Search */}
    <div className="col-12 col-md-5 col-lg-4 ms-auto">
        <div className="search-wrapper">
            <input
                className="form-control form-control-sm"
                placeholder="Search records..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{borderRadius: "8px"}}
            />
        </div>
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
                                    <span className="">
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

export default DepositHistory;


