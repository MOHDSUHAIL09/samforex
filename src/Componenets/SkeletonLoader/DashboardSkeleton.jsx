// src/components/DashboardSkeleton.jsx
import React from "react";
import SkeletonLoader from "./SkeletonLoader";


const DashboardSkeleton = () => {
  return (
    <div className="sk-dashboard">

      {/* ===== SIDEBAR ===== */}
      <div className="sk-sidebar d-none d-sm-block">
        {/* Brand */}
        <div className="sk-sidebar-brand">
          <SkeletonLoader width="40px" height="40px" borderRadius="50%" />
          <SkeletonLoader width="140px" height="28px" />
        </div>

        {/* Menu */}
        <div className="sk-sidebar-menu">
          {[
            "Home",
            "Deposit Fund",
            "Deposit History",
            "Invest",
            "Investment History",
            "Bot Status",
            "Bot Status History",
            "Income Payout History",
            "Token Mining",
            "Investment History",
            "Bot Status",
            "Bot Status History",
            "Income Payout History",
            "Token Mining History",
            "Token Mining Income",
            "Income Payout History",
            "Token Mining",
            "Token Mining History",
            "Token Mining History",
            "Fund Transfer"
          ].map((_, i) => (
            <div key={i} className="sk-menu-item">
              <SkeletonLoader width="20px" height="20px" borderRadius="50%" />
              <SkeletonLoader width="130px" height="16px" />
            </div>
          ))}
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="sk-main">

        {/* ===== HEADER ===== */}
        <div className="sk-header">
          <div className="sk-header-left">
            <SkeletonLoader width="24px" height="24px" />
            <SkeletonLoader width="200px" height="28px" />
          </div>
          <div className="d-none d-sm-block">
          <div className="sk-header-right ">
            <SkeletonLoader width="40px" height="40px" borderRadius="50%" />
            <SkeletonLoader width="100px" height="36px" borderRadius="20px" />
          </div>
          </div>

        </div>

        {/* ===== CONTENT ===== */}
        <div className="sk-content">


          {/* Income Wallet */}
          <div className="sk-row">
            <div className="sk-col-8">
              <div className="sk-card">
                <SkeletonLoader width="140px" height="22px" style={{ marginBottom: 16 }} />
                <div className="sk-row sk-gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="sk-col-4">
                      <SkeletonLoader width="100%" height="75px" borderRadius="10px" />
                    </div>
                  ))}
                </div>
                <div className="sk-row sk-gap-2 sk-mt-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="sk-col-4">
                      <SkeletonLoader width="100%" height="75px" borderRadius="10px" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* APEX Token */}
            <div className="sk-col-4">
              <div className="sk-card sk-apex-card">
                <div className="sk-flex sk-justify-between sk-align-center">
                  <div className="sk-flex sk-align-center sk-gap-2">
                    <SkeletonLoader width="30px" height="30px" borderRadius="50%" />
                    <SkeletonLoader width="60px" height="24px" />
                  </div>
                  <SkeletonLoader width="70px" height="20px" borderRadius="20px" />
                </div>
                <SkeletonLoader width="100%" height="75px" style={{ marginTop: 12 }} />
                <div className="sk-mt-2">
                  <SkeletonLoader width="100px" height="30px" />
                  <SkeletonLoader width="120px" height="14px" style={{ marginTop: "25px" }} />
                </div>
              </div>
            </div>
            </div>  
         

          {/* Apex Mining Program */}
          <div className="sk-card">
          <hr className="sk-hr" />
          <SkeletonLoader width="220px" height="28px" style={{ marginBottom: 16, marginTop: "-25px" }} />

          <div className="sk-row">
            <div className="sk-col-8">
              <div className="sk-row sk-gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="sk-col-4">
                    <SkeletonLoader width="100%" height="130px" borderRadius="12px" />
                  </div>
                ))}
              </div>
              <div className="sk-row sk-gap-2 sk-mt-2">
                {[1, 2].map(i => (
                  <div key={i} className="sk-col-6">
                    <SkeletonLoader width="100%" height="80px" borderRadius="12px" />
                  </div>
                ))}
              </div>
            </div>
            <div className="sk-col-4">
              <div className="sk-card">
                <SkeletonLoader width="100%" height="38px" style={{ marginBottom: 16 }} />
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="sk-flex sk-justify-between sk-mb-2">
                    <SkeletonLoader width="120px" height="16px" />
                    <SkeletonLoader width="40px" height="16px" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        

          {/* Payout Cards */}
          <hr className="sk-hr" />
          <SkeletonLoader width="160px" height="28px" style={{ marginBottom: 16, marginTop: "-30px" }} />

          <div className="sk-row sk-gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="sk-col-4">
                <div className="sk-card sk-payout-card">
                  <SkeletonLoader width="140px" height="22px" />
                  <div className="sk-mt-3">
                    <SkeletonLoader width="100%" height="40px" borderRadius="8px" />
                  </div>
                  <div className="sk-flex sk-justify-between sk-align-center sk-mt-3">
                    <div>
                      <SkeletonLoader width="70px" height="24px" />
                      <SkeletonLoader width="80px" height="14px" style={{ marginTop: 4 }} />
                    </div>
                    <SkeletonLoader width="80px" height="36px" borderRadius="8px" />
                  </div>
                  <SkeletonLoader width="100%" height="14px" style={{ marginTop: 12 }} />
                </div>
              </div>
            ))}
          </div>

        </div>
        
      </div>
    </div>
  );
};

export default DashboardSkeleton;