import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import { FaRankingStar } from "react-icons/fa6";
import { useUser } from "../../context/UserContext";


const Reward = () => {
  const { fetchData, userData } = useUser();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const regno = sessionStorage.getItem("Regno");

    const fetchData = async () => {
      try {
        const response = await apiClient.get(`/Dashboard/SalaryRank/${regno}`);
        const result = response?.data;

        if (result?.result === "true" && Array.isArray(result?.response?.data)) {
          setData(result.response.data);
        } else {
          setError("No reward data found");
        }
      } catch (err) {
        setError(err?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (!regno) {
      setError("Registration number not found");
      setLoading(false);
      return;
    }

    fetchData();
  }, []);

  // Updated status checker
  const getStatusInfo = (status) => {
    const statusMap = {
      'Qualified': { label: 'Qualified', className: 'qualified', icon: '🏆' },
      'Unqualified': { label: 'Pending', className: 'pending', icon: '⏳' },
      'Expired': { label: 'Expired', className: 'expired', icon: '⏰' },
      'Pending': { label: 'Pending', className: 'pending', icon: '⏳' }
    };

    // Check for string or numeric status
    const statusKey = status === '1' || status === 1 ? 'Qualified'
      : status === '0' ? 'Unqualified'
        : status === '2' ? 'Expired'
          : status === 'Qualified' ? 'Qualified'
            : status === 'Unqualified' ? 'Unqualified'
              : status === 'Expired' ? 'Expired'
                : 'Pending';

    return statusMap[statusKey] || statusMap['Pending'];
  };

  const isQualified = (status) => {
    return status === 'Qualified' || status === '1' || status === 1;
  };

  const isExpired = (status) => {
    return status === 'Expired' || status === '2' || status === 2;
  };

  const isUnqualified = (status) => {
    return status === 'Unqualified' || status === '0' || status === 0;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        background: '#f4f7fc'
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '4px solid #e2e8f0',
          borderTopColor: '#0d6efd',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        background: '#f4f7fc'
      }}>
        <div className="alert alert-danger" style={{ borderRadius: '16px', padding: '1rem 2rem' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* Main Container */
        .reward-wrapper {
          background: #f0f2f5;
          min-height: 100vh;
          padding: -0.5rem 1rem;
        }

        .reward-container {
          max-width: 1440px;
          margin: 0 auto;
        }

        /* Card Styles - Compact */
        .reward-card {
          transition: all 0.3s ease;
          height: 100%;
          border-radius: 16px !important;
          overflow: hidden;
          border: none !important;
        }

        .reward-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12) !important;
        }

        /* Expired Card - Reduced Opacity */
        .reward-card.expired-card {
          opacity: 0.6;
          filter: grayscale(0.3);
        }

        .reward-card.expired-card:hover {
          opacity: 0.8;
        }

        /* Unqualified Card */
        .reward-card.unqualified-card {
          opacity: 0.7;
        }

      /* Card Header - Compact */
.card-header-custom {
  background: linear-gradient(135deg, #28a745, #1e7e34) !important;
  color: white !important;
  border: none !important;
  padding: 1rem 1.25rem !important;
  border-radius: 0 !important;
}

.card-header-custom.expired {
  background: linear-gradient(135deg, #6c757d, #495057) !important;
}

.card-header-custom.unqualified {
  background: linear-gradient(135deg, #dc3545, #c82333) !important;
}

.card-header-custom.pending {
  background: linear-gradient(135deg, #ffc107, #d39e00) !important;
}

        .card-header-custom h5 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }

        .card-header-custom small {
          font-size: 0.7rem;
          opacity: 0.85;
        }

        .card-header-custom .reward-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.8);
          object-fit: cover;
          flex-shrink: 0;
        }

        /* Card Body - Compact */
        .card-body-compact {
          padding: 0.75rem 1rem 1rem !important;
        }

        /* Badge - Compact */
        .badge-custom {
          border-radius: 30px;
          padding: 0.25rem 0.9rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.3px;
        }

        /* Progress Bars - Compact */
        .progress-compact {
          height: 5px;
          border-radius: 50px;
          background-color: #e9ecef;
          margin-top: 2px;
        }

        .progress-bar-compact {
          border-radius: 50px;
          transition: width 0.6s ease;
          height: 5px;
        }

        .stat-label-compact {
          font-size: 0.65rem;
          color: #6c757d;
          font-weight: 600;
        }

        .stat-value-compact {
          font-size: 0.75rem;
          font-weight: 700;
          color: #1a1a2e;
        }

        /* Leg Boxes - Compact */
        .leg-box-compact {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 0.4rem 0.25rem;
          text-align: center;
          border: 1px solid #e9ecef;
          transition: all 0.2s ease;
          min-height: 85px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .leg-box-compact:hover {
          transform: scale(1.02);
        }

        .leg-box-compact .leg-label {
          color: #6c757d;
          font-size: 0.55rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .leg-box-compact .leg-value {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0b1a33;
          margin: 2px 0;
        }

        .leg-box-compact .leg-login {
          font-size: 0.55rem;
          color: #6c757d;
          font-weight: 500;
        }

        .leg-box-compact .leg-status {
          font-size: 0.55rem;
          font-weight: 700;
          margin-top: 2px;
        }

        .leg-box-compact .leg-status.qualified {
          color: #198754;
        }

        .leg-box-compact .leg-status.pending {
          color: #dc3545;
        }

        /* Others Box - Compact */
        .others-box-compact {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 0.3rem 0.5rem;
          text-align: center;
          border: 1px solid #e9ecef;
          margin-top: 0.3rem;
        }

        .others-box-compact .leg-label {
          color: #6c757d;
          font-size: 0.55rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .others-box-compact .leg-value {
          font-size: 0.85rem;
          font-weight: 700;
          color: #fd7e14;
        }

        /* Remark - Compact */
        .remark-compact {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 0.35rem 0.6rem;
          margin-top: 0.3rem;
          font-size: 0.65rem;
          color: #495057;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .remark-compact i {
          color: #6c757d;
          font-size: 0.7rem;
        }

        /* Footer - Compact */
        .footer-compact {
          border-top: 1px solid #e9ecef;
          padding-top: 0.6rem;
          margin-top: 0.6rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.3rem;
        }

        .footer-compact .date-text {
  font-size: 0.7rem;
  color: #6c757d;
  font-weight: 600;
}

.footer-compact .date-text strong {
  color: #495057;
  font-weight: 700;
}

.footer-compact .date-text span {
  font-weight: 700;
}
        .footer-compact .status-text {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
        }

        .footer-compact .status-text.qualified {
          color: #155724;
          background: #d4edda;
        }

        .footer-compact .status-text.pending {
          color: #856404;
          background: #fff3cd;
        }

        .footer-compact .status-text.unqualified {
          color: #721c24;
          background: #f8d7da;
        }

        .footer-compact .status-text.expired {
          color: #383d41;
          background: #e2e3e5;
        }

        /* Spacing utilities */
        .mb-2-compact {
          margin-bottom: 0.5rem;
        }

        /* Empty State */
        .empty-state {
          grid-column: 1 / -1;
          background: white;
          border-radius: 24px;
          padding: 3rem 1.5rem;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          border: 1px solid #e9ecef;
        }

        .empty-state i {
          font-size: 2.5rem;
          color: #b0c6dd;
        }

        .empty-state h5 {
          margin-top: 1rem;
          font-weight: 600;
          color: #1f3b5c;
          font-size: 1.1rem;
        }

        .empty-state p {
          color: #6c829e;
          font-size: 0.85rem;
          margin-bottom: 0;
        }

        /* Responsive */
        @media (max-width: 576px) {
          .reward-wrapper {
            padding: 0.75rem 0.5rem;
          }

          .card-header-custom {
            padding: 0.75rem 1rem !important;
          }

          .card-header-custom h5 {
            font-size: 0.9rem;
          }

          .card-header-custom .reward-icon {
            width: 40px;
            height: 40px;
          }

          .card-body-compact {
            padding: 0.6rem 0.75rem 0.75rem !important;
          }

          .leg-box-compact {
            min-height: 70px;
          }

          .leg-box-compact .leg-value {
            font-size: 0.75rem;
          }
        }

        @media (min-width: 768px) and (max-width: 991px) {
          .reward-container .row > div {
            flex: 0 0 50%;
            max-width: 50%;
          }
        }

 


      `}</style>


      <div className="reward-wrapper">
        <div className="reward-container">
          {/* INFO BANNER / NOTE - Fixed Design */}
          {/* INFO BANNER - Compact Inline */}
          <div
            className="mb-3"
            style={{
              background: "linear-gradient(135deg, #0d6efd, #3b82f6)",
              borderLeft: "6px solid #ffc107",
              borderRadius: "12px",
              padding: "10px 20px",
              color: "#fff",
              boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
                fontSize: "1rem",
                fontWeight: "700",
              }}
            >
              <i
                className="bi bi-info-circle-fill me-2"
                style={{ color: "green", fontSize: "1.3rem" }}
              ></i>
              <span>Important Note</span>
            </div>

            <div style={{ fontSize: "0.92rem", lineHeight: "1.3" }}>
              <div className="mb-2">
                <i
                  className="bi bi-trophy-fill me-2"
                  style={{ color: "#FFD700" }}
                ></i>
                <strong>Reward:</strong>{" "}
                Rewards are granted <strong>only once</strong> after you successfully
                meet all the required qualification criteria.
              </div>

              <div>
                <i
                  className="bi bi-cash-stack me-2"
                  style={{ color: "#7CFC00" }}
                ></i>
                <strong>Salary:</strong>{" "}
                Salary is paid <strong>every month</strong> as long as you continue to
                meet all the required conditions and maintain the reward rank you have
                achieved.
              </div>
            </div>
          </div>
          <div className="row g-3">
            {data.length > 0 ? (
              data.map((item, index) => {
                const statusInfo = getStatusInfo(item.rStatus);
                const isQualifiedStatus = isQualified(item.rStatus);
                const isExpiredStatus = isExpired(item.rStatus);
                const isUnqualifiedStatus = isUnqualified(item.rStatus);

                // Define target for each leg (1500 as per requirement)

                // Leg data with validation
                const legs = [
                  {
                    title: "1st Leg",
                    value: Number(item.FirstLeg || 0),
                    login: item.firstloginid || "--",
                  },
                  {
                    title: "2nd Leg",
                    value: Number(item.secondLeg || 0),
                    login: item.secondloginid || "--",
                  },
                  {
                    title: "3rd Leg",
                    value: Number(item.thirdLeg || 0),
                    login: item.thirdloginid || "--",
                  },
                  {
                    title: "4th Leg",
                    value: Number(item.FourthLeg || 0),
                    login: item.fourthloginid || "--",
                  },
                ];

                // Calculate qualified legs count
                const qualifiedLegs = legs.filter(leg => leg.value >= item.rcount).length;
                const totalLegs = legs.length;
                const downlineProgress = (qualifiedLegs / totalLegs) * 100;

                // Calculate total team business
                const totalTeam =
                  (item.FirstLeg || 0) +
                  (item.secondLeg || 0) +
                  (item.thirdLeg || 0) +
                  (item.FourthLeg || 0) +
                  Number(item.OthersLeg) || 0
                const targetTeam = item.leftp || 0;

                // Calculate progress percentages
                const directProgress = item.TargetDirect > 0
                  ? Math.min((item.DirectIds / item.TargetDirect) * 100, 100)
                  : 0;
                const teamProgress = targetTeam > 0
                  ? Math.min((totalTeam / targetTeam) * 100, 100)
                  : 0;

                // Determine card class based on status
                let cardClass = "card shadow-sm rounded-4 overflow-hidden reward-card";
                if (isExpiredStatus) {
                  cardClass += " expired-card";
                } else if (isUnqualifiedStatus) {
                  cardClass += " unqualified-card";
                }

                // Determine header class based on status
                let headerClass = "card-header-custom";
                if (isExpiredStatus) {
                  headerClass += " expired";
                } else if (isUnqualifiedStatus) {
                  headerClass += " unqualified";
                }

                return (

                  <div className="col-lg-6 col-md-6 mb-3" key={item.rid || index}>
                    <div className={cardClass}>
                      {/* Compact Header */}
                      <div className={headerClass}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="flex-grow-1" style={{ minWidth: 0, paddingRight: '0.5rem' }}>
                            <h5 className="fw-bold text-white d-flex gap-2">
                              <FaRankingStar style={{ fontSize: "20px" }} />
                              {item.reward || "Reward"}
                            </h5>
                            {/* <small className="d-flex align-items-center text-white">
                              <i className="bi bi-gift-fill"></i>
                              {item.gift || "No gift"}
                            </small> */}
                          </div>
                          <div className="text-end">
                            <div className="text-end">
                              <div style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: '500' }}>
                                Reward
                              </div>
                              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                                {item.SalaryAmt ? (
                                  <>
                                    <i className="bi bi-gift-fill me-1" style={{ fontSize: '1.4rem', color: '#ffd700' }}></i>
                                    ${Number(item.SalaryAmt).toLocaleString()}
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-gift-fill me-1" style={{ fontSize: '1.4rem', color: '#ffd700' }}></i>
                                    $0
                                  </>
                                )}
                              </div>
                            </div>
                            {/* Days remaining calculation */}
                            {item.EntryDate && item.rewardExpireDate && !isExpiredStatus && (
                              <small className="d-flex align-items-center text-white" style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                                <i className="bi bi-clock-history me-1"></i>
                                {(() => {
                                  const entryDate = new Date(item.EntryDate);
                                  const expireDate = new Date(item.rewardExpireDate);
                                  const currentDate = new Date();

                                  const totalDays = Math.ceil((expireDate - entryDate) / (1000 * 60 * 60 * 24));
                                  const remainingDays = Math.ceil((expireDate - currentDate) / (1000 * 60 * 60 * 24));
                                  const daysGo = Math.ceil((currentDate - entryDate) / (1000 * 60 * 60 * 24));

                                  return `${Math.max(0, daysGo)}/${totalDays} days remaining`;
                                })()}
                              </small>
                            )}
                            {isExpiredStatus && (
                              <small className="d-flex align-items-center text-white" style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                                <i className="bi bi-exclamation-circle me-1"></i>
                                Expired
                              </small>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Compact Body */}
                      <div className="card-body-compact">
                        {/* Stats with Progress Bars */}
                        <div className="mb-2-compact">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="stat-label-compact">Direct IDs</span>
                            <span className="stat-value-compact">
                              {item.DirectIds || 0}/{item.TargetDirect || 0}
                            </span>
                          </div>
                          <div className="progress-compact">
                            <div
                              className="progress-bar-compact bg-success"
                              style={{ width: `${directProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="mb-2-compact">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="stat-label-compact">Team Business</span>
                            <span className="stat-value-compact">
                              {totalTeam}/{targetTeam}
                            </span>
                          </div>
                          <div className="progress-compact">
                            <div
                              className="progress-bar-compact bg-info"
                              style={{ width: `${teamProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="mb-2-compact">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="stat-label-compact">Downline Business</span>
                            <span className="stat-value-compact">
                              {qualifiedLegs}/{totalLegs} Legs Qualified
                            </span>
                          </div>
                          <div className="progress-compact">
                            <div
                              className="progress-bar-compact bg-danger"
                              style={{ width: `${downlineProgress}%` }}
                            ></div>
                          </div>
                          <small style={{ fontSize: '.8rem', color: '#6c757d', display: 'block', marginTop: '2px' }}>
                            Required: Each leg must have   <span style={{ color: "green", fontWeight: "bold" }}>
                              ${item.rcount}+
                            </span>{" "} business
                          </small>
                        </div>

                        {/* salary section */}
                        {/* Salary Section - Redesigned with Bootstrap */}
                        <div className="bg-dark bg-gradient rounded-3 p-3 mb-3 border border-warning border-opacity-25 shadow-lg"
                          style={{ position: 'relative', overflow: 'hidden' }}>

                          {/* Decorative shine effect */}
                          <div className="position-absolute top-0 end-0 w-25 h-100 opacity-10"
                            style={{
                              background: 'radial-gradient(circle, rgba(86, 94, 247, 0.2) 0%, transparent 70%)',
                              transform: 'translateX(30%)'
                            }}>
                          </div>

                          <div className="d-flex justify-content-between align-items-center position-relative" style={{ zIndex: 1 }}>
                            <div>
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-wallet2 text-warning"></i>
                                <span className="text-white small text-uppercase fw-semibold tracking-wide"
                                  style={{ letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                                  Monthly Salary
                                </span>
                              </div>

                            </div>

                            <div className="text-end">
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-gift-fill text-warning" style={{ fontSize: '1.5rem' }}></i>
                                <span className="display-6 fw-bold text-warning"
                                  style={{
                                    fontSize: '2rem',
                                    lineHeight: 1,
                                    textShadow: '0 0 20px rgba(255,215,0,0.2)'
                                  }}>
                                  ${Number(item.SalaryAmt || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="text-white small" style={{ fontSize: '0.55rem' }}>
                                <i className="bi bi-calendar3 me-1"></i>
                                / Monthly      </div>
                            </div>
                          </div>
                        </div>



                        {/* Legs Grid - Compact with Validation */}
                        <div className="row g-2 mb-2-compact mt-1">
                          {legs.map((leg, legIndex) => {
                            const isLegQualified = leg.value >= item.rcount;

                            return (
                              <div className="col-6 col-md-3" key={legIndex}>
                                <div
                                  className="leg-box-compact"
                                  style={{
                                    border: `2px solid ${isLegQualified ? "#28a745" : "#dc3545"}`,
                                    background: isLegQualified ? "#f0fff4" : "#fff5f5",
                                  }}
                                >
                                  <div className="leg-label">{leg.title}</div>
                                  <div
                                    className="leg-value"
                                    style={{ color: isLegQualified ? "#198754" : "#dc3545" }}
                                  >
                                    {leg.value}
                                  </div>
                                  <div className="leg-login">
                                    {leg.login}
                                  </div>
                                  <div className={`leg-status ${isLegQualified ? "qualified" : "pending"}`}>
                                    {isLegQualified ? "Qualified" : "Pending"}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Others Leg */}
                        {item.OthersLeg > 0 && (
                          <div className="others-box-compact">
                            <div className="leg-label">Others Leg</div>
                            <div className="leg-value">${Number(item.OthersLeg).toFixed(2)}</div>
                          </div>
                        )}

                        {/* Remark */}
                        {item.remark && (
                          <div className="remark-compact">
                            <i className="bi bi-chat-left-text"></i>
                            <span>{item.remark}</span>
                          </div>
                        )}

                        {/* Compact Footer */}
                        <div className="footer-compact">
                          <div className="d-flex flex-column gap-1" style={{ flex: 1 }}>
                            {item?.achieveDate ? (
                              <div className="date-text" style={{ fontWeight: '900' }}>
                                <i className="bi bi-calendar-event me-1"></i>
                                <strong>Achieve Date:</strong>{" "}
                                <span style={{ fontWeight: '700', color: '#0d6efd' }}>
                                  {new Date(item.achieveDate).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            ) : (
                              item?.rewardExpireDate && (
                                <div className="date-text" style={{
                                  color: isExpiredStatus ? '#6c757d' : '#dc3545',
                                  fontWeight: '600'
                                }}>
                                  <i className="bi bi-clock me-1 fw-bold"></i>
                                  <strong>Expire Date:</strong>{" "}
                                  <span style={{
                                    fontWeight: '700',
                                    color: isExpiredStatus ? '#6c757d' : '#dc3545'
                                  }}>
                                    {new Date(item.rewardExpireDate).toLocaleString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </span>
                                </div>
                              )
                            )}
                          </div>

                          <span className={`status-text ${statusInfo.className}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <i className="bi bi-box-seam"></i>
                <h5>No rewards available</h5>
                <p>Start building your downline to unlock gifts.</p>
                <button
                  className="btn btn-primary mt-3 px-4 py-2 rounded-pill"
                  style={{
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(13, 110, 253, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(13, 110, 253, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.3)';
                  }}
                  onClick={() => {
                    const depositFund = userData?.Depositfund || 0;
                    if (depositFund > 0) {
                      window.location.href = '/dashboard/InvestFund';
                    } else {
                      window.location.href = '/dashboard/DepositFund';
                    }
                  }}
                >
                  <i className="bi bi-arrow-right-circle me-2"></i>
                  {userData?.Depositfund > 0 ? 'Invest Now' : 'Deposit First'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Reward;