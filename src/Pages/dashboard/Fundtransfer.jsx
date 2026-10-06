// Fundtransfer.jsx - WITH REACT-HOT-TOAST
import { useState, useRef } from "react";
import { RiP2pFill } from "react-icons/ri";
import { FaHistory } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import apiClient from "../../api/apiClient";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import Toast from '../../Componenets/ui/Toast';
import "bootstrap/dist/css/bootstrap.min.css";

const Fundtransfer = () => {
    const { userData, refreshData } = useUser();
    const navigate = useNavigate();

    // ===== CARD 1: Fund Transfer (Deposit to Deposit) =====
    const [amount1, setAmount1] = useState(100);
    const [investUserId1, setInvestUserId1] = useState("");
    const [checkingUser1, setCheckingUser1] = useState(false);
    const [validUser1, setValidUser1] = useState(false);
    const [userName1, setUserName1] = useState("");
    const [receiverLoginId1, setReceiverLoginId1] = useState("");
    const [transferLoading1, setTransferLoading1] = useState(false);
    const [otpLoading1, setOtpLoading1] = useState(false);
    const [otp1, setOtp1] = useState("");
    const [otpSent1, setOtpSent1] = useState(false);
    const [otpVerified1, setOtpVerified1] = useState(false);

    // ===== CARD 2: Income to Deposit =====
    const [amount2, setAmount2] = useState(100);
    const [transferLoading2, setTransferLoading2] = useState(false);
    const [otpLoading2, setOtpLoading2] = useState(false);
    const [otp2, setOtp2] = useState("");
    const [otpSent2, setOtpSent2] = useState(false);
    const [otpVerified2, setOtpVerified2] = useState(false);

    const loginId = sessionStorage.getItem("loginId");
    const regNo = sessionStorage.getItem("Regno");
    const debounceTimer1 = useRef(null);

    const depositOptions = [100, 300, 500, 1000, 10000, 50000];

    // ===== Format Functions =====
    const formatBalance = (amount) => {
        if (amount === undefined || amount === null) return `$0.00`;
        const num = Number(amount);
        if (isNaN(num)) return `$0.00`;
        return `$${num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const gotodepositHistory = (type) => {
        navigate(`/dashboard/DepositHistory?type=${encodeURIComponent(type)}`);
    };

    const goToFundInvest = (type) => {
        const encodedType = encodeURIComponent(type);
        navigate(`/dashboard/IncomeReport?type=${encodedType}`);
    };

    // ===== CARD 1: Check User =====
    const checkUser1 = async (id) => {
        if (!id?.trim() || id.trim().length < 3) {
            setValidUser1(false);
            setUserName1("");
            setReceiverLoginId1("");
            return;
        }

        setCheckingUser1(true);
        try {
            const res = await apiClient.get(`/Auth/UserDetailsById?loingId=${id}`);
            const data = res.data;

            if (data?.result === "true" && data?.user) {
                const user = data.user;
                const name = user.Name || user.fName || user.username || "";
                const loginid = user.loginid || user.LoginId || user.id || "";

                setValidUser1(true);
                setUserName1(name);
                setReceiverLoginId1(loginid);
                // toast.success(`User found: ${name}`);
            } else {
                setValidUser1(false);
                setUserName1("");
                setReceiverLoginId1("");
                toast.error("User ID not found");
            }
        } catch (err) {
            console.error("Error checking user:", err);
            setValidUser1(false);
            setUserName1("");
            setReceiverLoginId1("");
        } finally {
            setCheckingUser1(false);
        }
    };

    // ===== CARD 1: Handle User ID Change =====
    const handleUserIdChange1 = (e) => {
        const value = e.target.value;
        setInvestUserId1(value);

        if (validUser1) {
            setValidUser1(false);
            setUserName1("");
            setReceiverLoginId1("");
        }

        if (debounceTimer1.current) clearTimeout(debounceTimer1.current);

        if (value.trim().length >= 8) {
            debounceTimer1.current = setTimeout(() => checkUser1(value), 500);
        }
    };

    // ===== CARD 1: Send OTP =====
    const handleSendOTP1 = async () => {
        try {
            if (!loginId || !regNo) {
                toast.error("Login ID not found");
                return;
            }
            if (!validUser1) {
                toast.error("Please enter a valid User ID first");
                return;
            }

            setOtpLoading1(true);
            setOtpVerified1(false);
            const response = await apiClient.post('/Auth/genrate-otp', null, {
                params: { loginid: loginId, regno: regNo }
            });

            if (response.data.result === "true") {
                toast.success(response.data.message || "OTP sent successfully!");
                setOtpSent1(true);
            } else {
                toast.error(response.data.message || "Failed to send OTP");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to send OTP");
        } finally {
            setOtpLoading1(false);
        }
    };

    // ===== CARD 1: Verify OTP =====
    const handleVerifyOTP1 = async () => {
        try {
            if (!otp1 || otp1.length < 6) {
                toast.error("Please enter valid 6-digit OTP");
                return;
            }
            if (!loginId || !regNo) {
                toast.error("Login ID or Registration number not found");
                return;
            }

            setOtpLoading1(true);
            const response = await apiClient.post('/Auth/verify-otp', null, {
                params: { loginid: loginId, regno: regNo, otp: otp1 }
            });

            if (response.data.result === "true") {
                toast.success("OTP Verified Successfully");
                setOtpVerified1(true);
            } else {
                setOtpVerified1(false);
                toast.error(response.data.message || "Invalid OTP");
            }
        } catch (error) {
            setOtpVerified1(false);
            toast.error(error?.response?.data?.message || "OTP verification failed");
        } finally {
            setOtpLoading1(false);
        }
    };

    // ===== CARD 1: Fund Transfer (Deposit to Deposit) =====
    const handleFundTransfer = async () => {
        if (!investUserId1 || investUserId1.trim() === "") {
            toast.error("Please enter User ID");
            return;
        }
        if (!validUser1) {
            toast.error("Please enter a valid User ID");
            return;
        }
        if (!amount1 || amount1 <= 0) {
            toast.error("Please enter valid amount");
            return;
        }
        if (amount1 < 10) {
            toast.error("Minimum transfer amount is $10");
            return;
        }
        if (!otpVerified1) {
            toast.error("Please verify OTP first");
            return;
        }

        const walletBalance = userData?.Depositfund || userData?.WorkingWallet || 0;
        if (amount1 > walletBalance) {
            toast.error(`Insufficient Balance. Available: ${formatBalance(walletBalance)}`);
            return;
        }
        if (receiverLoginId1 === loginId) {
            toast.error("Cannot transfer to yourself");
            return;
        }

        setTransferLoading1(true);
        try {
            const payload = {
                regno: parseInt(regNo),
                reciveId: receiverLoginId1 || investUserId1,
                amount: Number(amount1)
            };

            const response = await apiClient.post('/IncomePayout/deposit-to-deposit', payload);

            if (response.data?.success === true || response.data?.result === "true") {
                Swal.fire({
                    icon: 'success',
                    title: 'Fund Transfer Successful!',
                    text: response.data?.message || 'Your fund has been transferred successfully.',
                    timer: 3000,
                    showConfirmButton: true,
                    confirmButtonColor: '#667eea',
                    confirmButtonText: 'OK'
                });

                setAmount1(100);
                setInvestUserId1("");
                setUserName1("");
                setValidUser1(false);
                setReceiverLoginId1("");
                setOtp1("");
                setOtpSent1(false);
                setOtpVerified1(false);
                await refreshData();
            } else {
                toast.error(response.data?.message || "Transfer failed");
            }
        } catch (err) {
            console.error("Transfer error:", err);
            toast.error(err.response?.data?.message || err.message || "Error processing transfer");
        } finally {
            setTransferLoading1(false);
        }
    };

    // ===== CARD 2: Send OTP =====
    const handleSendOTP2 = async () => {
        try {
            if (!loginId || !regNo) {
                toast.error("Login ID or Registration number not found");
                return;
            }

            setOtpLoading2(true);
            setOtpVerified2(false);
            const response = await apiClient.post('/Auth/genrate-otp', null, {
                params: { loginid: loginId, regno: regNo }
            });

            if (response.data.result === "true") {
                toast.success(response.data.message || "OTP sent successfully!");
                setOtpSent2(true);
            } else {
                toast.error(response.data.message || "Failed to send OTP");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to send OTP");
        } finally {
            setOtpLoading2(false);
        }
    };

    // ===== CARD 2: Verify OTP =====
    const handleVerifyOTP2 = async () => {
        try {
            if (!otp2 || otp2.length < 6) {
                toast.error("Please enter valid 6-digit OTP");
                return;
            }
            if (!loginId || !regNo) {
                toast.error("Login ID or Registration number not found");
                return;
            }

            setOtpLoading2(true);
            const response = await apiClient.post('/Auth/verify-otp', null, {
                params: { loginid: loginId, regno: regNo, otp: otp2 }
            });

            if (response.data.result === "true") {
                toast.success("OTP Verified Successfully");
                setOtpVerified2(true);
            } else {
                setOtpVerified2(false);
                toast.error(response.data.message || "Invalid OTP");
            }
        } catch (error) {
            setOtpVerified2(false);
            toast.error(error?.response?.data?.message || "OTP verification failed");
        } finally {
            setOtpLoading2(false);
        }
    };

    // ===== CARD 2: Income to Deposit Transfer =====
    const handleIncomeToDepositTransfer = async () => {
        if (!amount2 || amount2 <= 0) {
            toast.error("Please enter valid amount");
            return;
        }
        if (amount2 < 10) {
            toast.error("Minimum transfer amount is $10");
            return;
        }
        if (!otpVerified2) {
            toast.error("Please verify OTP first");
            return;
        }

        const incomeBalance = userData?.WorkingWallet || 0;
        if (amount2 > incomeBalance) {
            toast.error(`Insufficient Income Balance. Available: $${incomeBalance.toFixed(2)}`);
            return;
        }

        setTransferLoading2(true);
        try {
            const payload = {
                regno: parseInt(regNo),
                reciveId: loginId,
                amount: Number(amount2)
            };
            const response = await apiClient.post('/IncomePayout/income-transfer', payload);

            if (response.data?.success === true || response.data?.result === "true") {
                Swal.fire({
                    icon: 'success',
                    title: 'Income Transfer Successful!',
                    text: response.data?.message || 'Your income has been transferred to deposit successfully.',
                    timer: 3000,
                    showConfirmButton: true,
                    confirmButtonColor: '#667eea',
                    confirmButtonText: 'OK'
                });

                setAmount2(100);
                setOtp2("");
                setOtpSent2(false);
                setOtpVerified2(false);
                await refreshData();
            } else {
                toast.error(response.data?.message || "Transfer failed");
            }
        } catch (err) {
            console.error("Income transfer error:", err);
            toast.error(err.response?.data?.message || err.message || "Error processing transfer");
        } finally {
            setTransferLoading2(false);
        }
    };

    return (
        <>
            <Toast />

            <div className="deposit-to-deposit-container">
                <div className="container-fluid">
                    <div className="row g-4">

                        {/* ===== CARD 1: Fund Transfer ===== */}
                        <div className="col-12 col-lg-6">
                            <div className="transfer-card">
                                <div className="transfer-card-header">
                                    <div className="transfer-title">
                                        <RiP2pFill size={24} className="transfer-icon" />
                                        <h5>Fund Transfer</h5>
                                    </div>

                                    <button className="btn-primary" onClick={() => gotodepositHistory("Fund Transfer")}>
                                        <span className="d-flex">

                                            History
                                        </span>
                                    </button>
                                </div>
                                <div className="transfer-card-body">
                                    {/* Wallet Info */}
                                    <div className="wallet-info">
                                        <span className="wallet-label">Deposit Wallet</span>
                                        <span className="wallet-amount text-primary">
                                            {formatBalance(userData?.Depositfund || "00")}
                                        </span>
                                    </div>

                                    {/* User ID */}
                                    <div className="form-group03">
                                        <label className="form-label mb-1">USER ID *</label>
                                        <input
                                            type="text"
                                            className="form-control-field"
                                            value={investUserId1}
                                            onChange={handleUserIdChange1}
                                            placeholder="Enter User ID"
                                        />
                                        {checkingUser1 && (
                                            <small className="status-msg info">⏳ Checking user...</small>
                                        )}
                                        {validUser1 && (
                                            <small className="status-msg success">✓ {userName1}</small>
                                        )}
                                        {investUserId1 && !validUser1 && !checkingUser1 && investUserId1.trim().length >= 8 && (
                                            <small className="status-msg error">❌ User ID not found</small>
                                        )}
                                    </div>

                                    {/* Quick Amount */}
                                    <div className="form-group03">
                                        <label className="form-label mt-3 mb-1">QUICK AMOUNT</label>
                                        <div className="quick-amount-grid">
                                            {depositOptions.map((opt) => (
                                                <button 
                                                    key={opt}
                                                    className={`quick-amount-btn ${amount1 === opt ? "active" : ""}`}
                                                    onClick={() => setAmount1(opt)}
                                                    type="button"
                                                >
                                                    ${opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Amount Input */}
                                    <div className="form-group03">
                                        <label className="form-label mt-3 mb-1">AMOUNT *</label>
                                        <div className="amount-input-wrapper">
                                            <span className="currency-sign">$</span>
                                            <input
                                                type="number"
                                                className="amount-input-field"
                                                value={amount1}
                                                onChange={(e) => setAmount1(Number(e.target.value))}
                                                min="10"
                                                placeholder="Enter amount (min $10)"
                                            />
                                            <button
                                                className="clear-input-btn"
                                                onClick={() => setAmount1(0)}
                                                type="button"
                                            >
                                                <IoClose />
                                            </button>
                                        </div>
                                    </div>

                                    {/* OTP Section */}
                                    <div className="amount-area mt-3">
                                        <div className="d-flex gap-2">
                                            <div className="flex-grow-1">
                                                <input
                                                    type="number"
                                                    className="amount-input"
                                                    placeholder="Enter OTP"
                                                    value={otp1}
                                                    onChange={(e) => setOtp1(e.target.value)}
                                                    disabled={!otpSent1}
                                                />
                                            </div>
                                            {!otpSent1 ? (
                                                <button

                                                    className="btn btn-primary text-nowrap"
                                                    onClick={handleSendOTP1}
                                                    disabled={otpLoading1 || !validUser1}
                                                >
                                                    {otpLoading1 ? "Processing" : "Send OTP"}
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-success text-nowrap"
                                                    onClick={handleVerifyOTP1}
                                                    disabled={otpLoading1 || otp1.length < 6}
                                                >
                                                    {otpLoading1 ? "Processing" : "Verify"}
                                                </button>
                                            )}
                                        </div>
                                        {otpVerified1 && (
                                            <small className="text-success"> OTP Verified</small>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        className="submit-transfer-btn"
                                        onClick={handleFundTransfer}
                                        disabled={!validUser1 || transferLoading1 || amount1 <= 0 || !investUserId1 || !otpVerified1}
                                    >
                                        {transferLoading1 ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            " Fund Transfer"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ===== CARD 2: Income to Deposit ===== */}
                        <div className="col-12 col-lg-6">
                            <div className="transfer-card">
                                <div className="transfer-card-header">
                                    <div className="transfer-title">
                                        <RiP2pFill size={24} className="transfer-icon" />
                                        <h5>Income → Deposit</h5>
                                    </div>

                                    <button className="btn-primary" onClick={() => goToFundInvest("USDT Transfer")}>
                                        History
                                    </button>
                                </div>

                                <div className="transfer-card-body">
                                    {/* Wallet Info */}
                                    <div className="wallet-info">
                                        <span className="wallet-label">Income Wallet</span>
                                        <span className="wallet-amount" style={{ color: '#667eea' }}>
                                            ${userData?.WorkingWallet?.toFixed(2) || '0.00'}
                                        </span>
                                    </div>

                                    {/* User ID (Auto) */}
                                    <div className="form-group03">
                                        <label className="form-label mb-1">USER ID</label>
                                        <input
                                            type="text"
                                            className="form-control-field"
                                            value={userData?.loginid}
                                            readOnly
                                            disabled
                                            style={{ color: '#667eea', fontWeight: '600' }}
                                        />
                                    </div>

                                    {/* Quick Amount */}
                                    <div className="form-group03">
                                        <label className="form-label mt-3 mb-1">QUICK AMOUNT</label>
                                        <div className="quick-amount-grid">
                                            {depositOptions.map((opt) => (
                                                <button
                                                    key={opt}
                                                    className={`quick-amount-btn ${amount2 === opt ? "active" : ""}`}
                                                    onClick={() => setAmount2(opt)}
                                                    type="button"
                                                >
                                                    ${opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Amount Input */}
                                    <div className="form-group03">
                                        <label className="form-label mt-3 mb-1">AMOUNT *</label>
                                        <div className="amount-input-wrapper">
                                            <span className="currency-sign">$</span>
                                            <input
                                                type="number"
                                                className="amount-input-field"
                                                value={amount2}
                                                onChange={(e) => setAmount2(Number(e.target.value))}
                                                min="10"
                                                placeholder="Enter amount (min $10)"
                                            />
                                            <button
                                                className="clear-input-btn"
                                                onClick={() => setAmount2(0)}
                                                type="button"
                                            >
                                                <IoClose />
                                            </button>
                                        </div>
                                    </div>

                                    {/* OTP Section */}
                                    <div className="amount-area mt-3">
                                        <div className="d-flex gap-2">
                                            <div className="flex-grow-1">
                                                <input
                                                    type="number"
                                                    className="amount-input"
                                                    placeholder="Enter OTP"
                                                    value={otp2}
                                                    onChange={(e) => setOtp2(e.target.value)}
                                                    disabled={!otpSent2}
                                                    maxLength="6"
                                                />
                                            </div>
                                            {!otpSent2 ? (
                                                <button
                                                    className="btn btn-primary text-nowrap"
                                                    onClick={handleSendOTP2}
                                                    disabled={otpLoading2}
                                                >
                                                    {otpLoading2 ? "Processing" : "Send OTP"}
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-success text-nowrap"
                                                    onClick={handleVerifyOTP2}
                                                    disabled={otpLoading2 || otp2.length < 6}
                                                >
                                                    {otpLoading2 ? "Processing" : "Verify"}
                                                </button>
                                            )}
                                        </div>
                                        {otpVerified2 && (
                                            <small className="text-success"> OTP Verified</small>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        className="submit-transfer-btn"
                                        onClick={handleIncomeToDepositTransfer}
                                        disabled={transferLoading2 || !otpVerified2 || amount2 <= 0 || amount2 < 10}
                                    >
                                        {transferLoading2 ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            " Transfer to Deposit"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default Fundtransfer;