// File: src/components/BotTradingHistory.jsx

import { useState, useEffect, useRef } from "react";
import CustomTable from "../../Componenets/ui/customtable/CustomTable";
import Pagination from "../../Componenets/ui/pagination/Pagination";
import apiClient from "../../api/apiClient";   // 👈 path apne project ke hisaab se

const BotTradingHistory = () => {
  // ✅ Local state
  const [records, setRecords] = useState([]);
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const regno = sessionStorage.getItem("Regno");
  const intervalRef = useRef(null);

  // ===================== ✅ FETCH BOT EARNINGS (API) =====================
  const fetchBotEarnings = async () => {
    if (!regno) return;

    try {
      setLoading(true);

      const response = await apiClient.get("/Trading/BotReport", {
        params: {
          regno: regno,
          PageIndex: 1,
          PageSize: 10000,
        },
      });

      console.log("tradingbot", response);

      // ✅ Same pattern as Signup.jsx
      if (response.data?.result === "true") {
        const data = response.data.response?.data || [];

        setRecords(data);

        // ✅ Total earnings
        const total = data.reduce((sum, item) => {
          return sum + (parseFloat(item.TotalEarnings) || 0);
        }, 0);
        setTotalEarnings(total);

        // ✅ Current earnings (open record)
        const openRecord = data.find((item) => item.status === 1);
        if (openRecord) {
          setCurrentEarnings(parseFloat(openRecord.TotalEarnings) || 0);
        } else {
          setCurrentEarnings(total);
        }
      } else {
        const errorMsg = response.data?.message || "Failed to fetch bot earnings";
        console.error(
          "Bot Report API error:",
          Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg
        );
        setRecords([]);
        setCurrentEarnings(0);
        setTotalEarnings(0);
      }
    } catch (error) {
      console.error("Bot earnings fetch error:", error);

      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        console.error("API Message:", Array.isArray(msg) ? msg.join(", ") : msg);
      } else if (error.response?.data?.title) {
        console.error("API Title:", error.response.data.title);
      } else if (error.response?.data?.errors) {
        const errorsList = Object.values(error.response.data.errors).flat();
        console.error("Validation Errors:", errorsList.join(", "));
      } else if (error.code === "ECONNABORTED") {
        console.error("Request timed out");
      } else if (!error.response) {
        console.error("Network error");
      }

      setRecords([]);
      setCurrentEarnings(0);
      setTotalEarnings(0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial fetch — API se data
  useEffect(() => {
    if (regno) {
      fetchBotEarnings();
    }
  }, [regno]);

  // ===================== ✅ START INTERVAL  =====================
  const startInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setRecords((prevRecords) => {
        const updatedRecords = prevRecords.map((record) => {
          if (record.status === 1) {
            const currentEarn = parseFloat(record.TotalEarnings) || 0;
            const increment = (record.PerSecondEarnings);
            const shouldIncrease = Math.random() < 0.5;
            const newEarnings = shouldIncrease
              ? currentEarn + increment
              : currentEarn - increment;
            return { ...record, TotalEarnings: newEarnings };
          }
          return record;
        });

        // ✅ Update currentEarnings
        const openRecord = updatedRecords.find((item) => item.status === 1);
        if (openRecord) {
          setCurrentEarnings(parseFloat(openRecord.TotalEarnings) || 0);
        }

        // ✅ Update totalEarnings
        const total = updatedRecords.reduce((sum, item) => {
          return sum + (parseFloat(item.TotalEarnings) || 0);
        }, 0);
        setTotalEarnings(total);

        return updatedRecords;
      });
    }, 1000);
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // ✅ Start interval when records loaded (API data aane ke baad)
  useEffect(() => {
    if (records.length > 0) {
      startInterval();
    }
    return () => stopInterval();
  }, [records.length]);

  // ===================== FORMAT FUNCTIONS =====================
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 1: return "bg-success";
      case 0: return "bg-danger";
      default: return "bg-secondary";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1: return "Open";
      case 0: return "Closed";
      case 2: return "Closed";
      default: return "Closed";
    }
  };

  // ===================== FILTER & PAGINATION =====================
  const filteredRecords = records.filter((row) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      row.betAmount?.toString().toLowerCase().includes(searchLower) ||
      row.currency?.toLowerCase().includes(searchLower) ||
      row.entryDate?.toLowerCase().includes(searchLower) ||
      row.endtime?.toLowerCase().includes(searchLower) ||
      row.slot?.toString().toLowerCase().includes(searchLower) ||
      row.currencyRate?.toString().toLowerCase().includes(searchLower) ||
      row.status?.toString().toLowerCase().includes(searchLower)
    );
  });

  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (pageIndex - 1) * itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  const columns = [
    "Sl.No.",
    "BotStart Date",
    "BotEnd Date",
    "Amount",
    "Bot Roi/Day",
    "Bot Earn",
    "Currency",
    "Currency Rate",
    "Slot",
    "Type",
    "Status",
  ];

  // ===================== RENDER =====================
  return (
    <div className="Table-container royalty-main-wrapper mb-5 p-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <h3 className="mb-0">Bot Trading History</h3>
      </div>

      <div className="d-flex justify-content-between entries-search-bar entries-control mb-3">
        <div className="entries-control">
          <label>Show entries:</label>
          <select
            className="form-select"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            {[10, 25, 50, 75, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="search-wrapper mt-3">
          <input
            className="form-control search-input"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="report-card">
        <CustomTable columns={columns} loading={loading}>
          {currentRecords.length > 0 ? (
            currentRecords.map((row, index) => {
              const currentEarn = parseFloat(row.TotalEarnings) || 0;
              const perdayroi = parseFloat(row.perdayroi) || 0;
              const betAmount = parseFloat(row.betAmount) || 0;

              const isEarningsNegative = currentEarn < 0;
              const isRoiNegative = perdayroi < 0;

              return (
                <tr key={index}>
                  <td className="text-center">
                    <div className="sr-no-circle">{startIndex + index + 1}</div>
                  </td>
                  <td>{formatDate(row.entryDate)}</td>
                  <td>{formatDate(row.endtime)}</td>
                  <td style={{ color: "#3b82f6", fontWeight: "600" }}>
                    {formatAmount(betAmount)}
                  </td>

                  {getStatusText(row.status) === "Open" ? (
                    <>
                      <td style={{ color: "#3b82f6", fontWeight: "600" }}>-</td>
                      <td
                        style={{
                          color: isEarningsNegative ? "#dc3545" : "#3b82f6",
                          fontWeight: "600",
                        }}
                      >
                        ${currentEarn.toFixed(8)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td
                        style={{
                          color: isRoiNegative ? "#dc3545" : "#3b82f6",
                          fontWeight: "600",
                        }}
                      >
                        {perdayroi.toFixed(4)}%
                      </td>
                      <td
                        style={{
                          color: isEarningsNegative ? "#dc3545" : "#3b82f6",
                          fontWeight: "600",
                        }}
                      >
                        ${((perdayroi * betAmount) / 100).toFixed(4)}
                      </td>
                    </>
                  )}
                  <td>{row.currency?.toUpperCase() || "-"}</td>
                  <td>${row.currencyRate || "-"}</td>
                  <td>{row.slot || "-"} H</td>
                  <td>{row.predict || "-"}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(row.status)}`}>
                      {getStatusText(row.status)}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                {loading ? "Loading..." : "No records found"}
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
  );
};

export default BotTradingHistory;