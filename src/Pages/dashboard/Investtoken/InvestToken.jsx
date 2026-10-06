// InvestToken.jsx - Complete Fixed Code
import React, { useState } from "react";
import "./InvestToken.css";
import { Link } from "react-router-dom";
import apiClient from "../../../api/apiClient";
import { useUser } from "../../../context/UserContext";
import { Wallet } from "lucide-react";

const ApexMiningProgram = () => {
  const [tier1Amount, setTier1Amount] = useState("");
  const [tier2Amount, setTier2Amount] = useState("");
  const [tier3Amount, setTier3Amount] = useState("");
  const [loadingTier1, setLoadingTier1] = useState(false);
  const [loadingTier2, setLoadingTier2] = useState(false);
  const [loadingTier3, setLoadingTier3] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const { userData, refreshData } = useUser();

  // ✅ Show Toast
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // ✅ API Call Function
  const callInvestAPI = async (regno, miningAmt, uregno, slotNum, setLoading) => {
    try {
      setLoading(true);

      // ✅ API Call - Using base URL from apiClient
      const response = await apiClient.post(`/Token/TokenMiningAsync`, null, {
        params: {
          Regno: regno,
          MiningAmt: miningAmt,
          URegno: uregno,
          SlotNum: slotNum
        }
      });

      // ✅ Check response - result can be boolean or string
      if (response.data?.result === true || response.data?.result === "true") {
        // ✅ SUCCESS - API ka exact message dikhao
        showToast(`✅ ${response.data?.message || 'Investment Successful!'}`, "success");

        // ✅ Refresh data - balance update
        await refreshData();

        // ✅ Amount clear karo
        return response.data;
      } else {
        // ✅ ERROR - API ka exact message dikhao
        showToast(` ${response.data?.message || 'Transaction failed'}`, "error");
        return null;
      }
    } catch (error) {
      console.error(" API Error:", error);

      // ✅ ERROR - API ka exact message dikhao
      let errorMsg = error.response?.data?.message || error.message || "Something went wrong";
      showToast(` ${errorMsg}`, "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get Slot Number based on Tier
  const getSlotNumber = (tier) => {
    switch (tier) {
      case "Tier 1": return 10;
      case "Tier 2": return 8;
      case "Tier 3": return 6;
      default: return 0;
    }
  };

  const getLoadingState = (tier) => {
    switch (tier) {
      case "Tier 1": return loadingTier1;
      case "Tier 2": return loadingTier2;
      case "Tier 3": return loadingTier3;
      default: return false;
    }
  };

  const getSetLoading = (tier) => {
    switch (tier) {
      case "Tier 1": return setLoadingTier1;
      case "Tier 2": return setLoadingTier2;
      case "Tier 3": return setLoadingTier3;
      default: return () => { };
    }
  };

  const getAmountSetter = (tier) => {
    switch (tier) {
      case "Tier 1": return setTier1Amount;
      case "Tier 2": return setTier2Amount;
      case "Tier 3": return setTier3Amount;
      default: return () => { };
    }
  };

  const handleInvest = async (tier, amount) => {
    const loading = getLoadingState(tier);

    if (loading) return;

    if (!amount || amount <= 0) {
      showToast(`⚠️ Please enter a valid amount for ${tier}`, "error");
      return;
    }

    const amountNum = parseFloat(amount);
    const slotNum = getSlotNumber(tier);
    const regno = sessionStorage.getItem("Regno") || 1;
    const uregno = 0;

    let isValid = false;
    let minAmount = 0;
    let maxAmount = 0;

    switch (tier) {
      case "Tier 1":
        isValid = amountNum >= 100 && amountNum <= 5000;
        minAmount = 100;
        maxAmount = 5000;
        break;
      case "Tier 2":
        isValid = amountNum >= 5001 && amountNum <= 15000;
        minAmount = 5001;
        maxAmount = 15000;
        break;
      case "Tier 3":
        isValid = amountNum >= 15001 && amountNum <= 25000;
        minAmount = 15001;
        maxAmount = 25000;
        break;
      default:
        isValid = false;
    }

    if (!isValid) {
      showToast(` Amount must be between $${minAmount} and $${maxAmount} for ${tier}`, "error");
      return;
    }

    const setLoading = getSetLoading(tier);
    const setAmount = getAmountSetter(tier);

    const result = await callInvestAPI(regno, amountNum, uregno, slotNum, setLoading);

    if (result && (result.result === true || result.result === "true")) {
      setAmount("");
    }
  };

  return (
    <div className="apex-mining-app">

      {/* ✅ Toast Notification */}
      {toast.show && (
        <div className={`apex-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}


    <div className=" d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 apex-header p-4 rounded-4"
    style={{
      background: '#ffff',
      boxShadow: '0 2px 0px rgba(0, 0, 0, 0.1)',   
      overflow: 'hidden',
      zIndex: 1
}}>
  {/* Animated Background Glow */}
  <div style={{
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(102,126,234,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'pulseGlow 4s ease-in-out infinite'
  }}></div>
  
  <div style={{ position: 'relative', zIndex: 1 }}>
    <h1 className="mb-0" style={{
      color: '#fff',
      fontWeight: '900',
      fontSize: '2rem',
      letterSpacing: '3px',
      background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: 'none'
    }}>
      APEX MINING
    </h1>
  
  </div>
  
  <div className="d-flex align-items-center gap-3 flex-wrap" style={{ position: 'relative', zIndex: 1 }}>
    {/* Premium Wallet Card */}
    <div className="btn-primary ">
        <Wallet size={18} style={{ color: '#fff' }} />
      <div>
        
        <span style={{ 
          color: '#fff',
          fontWeight: '600',
          fontSize: '15px',
          marginLeft: "5px"
        }}>
          ${userData?.Depositfund?.toLocaleString() || 0}
        </span>
      </div>
    </div>
    
    {/* Premium History Button */}
    <Link to="/dashboard/InvestTokenHistory">
      <button className="btn-primary">
        History
      </button>
    </Link>
  </div>
</div>




      <div className="apex-tiers-row">
        {/* Tier 1 */}
        <div className="apex-tier-card">
          <h2>TIER 1</h2>
          <p className="apex-investment-range">$100 – $5,000</p>
          <div className="apex-lockup">LOCK-UP: 10 MONTHS</div>
          <div className="apex-return">2X RETURN IN APEX TOKENS</div>
          <div className="apex-invest-group">
            <input
              type="number"
              placeholder="Enter amount"
              value={tier1Amount}
              onChange={(e) => setTier1Amount(e.target.value)}
              disabled={loadingTier1}
            />
            <button className="btn-primary"
              onClick={() => handleInvest("Tier 1", tier1Amount)}
              disabled={loadingTier1}
            >
              {loadingTier1 ? 'Processing...' : 'Invest'}
            </button>
          </div>
        </div>

        {/* Tier 2 */}
        <div className="apex-tier-card">
          <h2>TIER 2</h2>
          <p className="apex-investment-range">$5,001 – $15,000</p>
          <div className="apex-lockup">LOCK-UP: 8 MONTHS</div>
          <div className="apex-return">2X RETURN IN APEX TOKENS</div>
          <div className="apex-invest-group">
            <input
              type="number"
              placeholder="Enter amount"
              value={tier2Amount}
              onChange={(e) => setTier2Amount(e.target.value)}
              disabled={loadingTier2}
            />
            <button className="btn-primary"
              onClick={() => handleInvest("Tier 2", tier2Amount)}
              disabled={loadingTier2}
            >
              {loadingTier2 ? ' Processing...' : 'Invest'}
            </button>
          </div>
        </div>

        {/* Tier 3 */}
        <div className="apex-tier-card">
          <h2>TIER 3</h2>
          <p className="apex-investment-range">$15,001 – $25,000</p>
          <div className="apex-lockup">LOCK-UP: 6 MONTHS</div>
          <div className="apex-return">2X RETURN IN APEX TOKENS</div>
          <div className="apex-invest-group">
            <input
              type="number"
              placeholder="Enter amount"
              value={tier3Amount}
              onChange={(e) => setTier3Amount(e.target.value)}
              disabled={loadingTier3}
            />
            <button className="btn-primary"
              onClick={() => handleInvest("Tier 3", tier3Amount)}
              disabled={loadingTier3}
            >
              {loadingTier3 ? ' Processing...' : 'Invest'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApexMiningProgram;