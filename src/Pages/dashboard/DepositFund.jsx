import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Wallet, History, Copy, Share2, Smartphone, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import apiClient from '../../api/apiClient';
import Toast from '../../Componenets/ui/Toast';
import { useUser } from '../../context/UserContext';

const DepositFund = () => {
    const { userData, refreshData } = useUser();
    const [walletAddress, setWalletAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [error, setError] = useState(null);

    const [timeLeft, setTimeLeft] = useState(300);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [isTimerComplete, setIsTimerComplete] = useState(false);

    // Track if ConfirmDeposit is successful
    const [isConfirmSuccess, setIsConfirmSuccess] = useState(false);

    const [isModalShown, setIsModalShown] = useState(false);
    const modalShownRef = useRef(false);

    // 🔴 NEW: Track if ConfirmDeposit has returned true (only once)
    const isDepositConfirmedRef = useRef(false);

    // 🔴 NEW: Track if FundDeposit has been called (only once)
    const [isFundDepositCalled, setIsFundDepositCalled] = useState(false);

    const regno = sessionStorage.getItem('Regno');

    // ============================================================
    // FUNDDEPOSIT API CALL - SIRF 1 BAAR
    // ============================================================
    const callFundDepositAPI = async () => {
        // Agar already called hai toh return
        if (isFundDepositCalled) {
            return;
        }

        if (modalShownRef.current) {
            return;
        }

        try {
            const payload = {
                walletAddress: walletAddress,
                regno: parseInt(regno)
            };


            const response = await apiClient.post('/DepositReport/FundDeposit', payload);

            if ((response.data?.result === "true" || response.data?.result === true) && !modalShownRef.current) {
                modalShownRef.current = true;
                setIsModalShown(true);

                showSuccessModal(response.data?.message || 'Deposit confirmed successfully!');

                setIsConfirmSuccess(false);

                await refreshData();
            }

        } catch (err) {
            if (err.response) {
                console.error(err.response.data);
                console.error(err.response.status);
            }
        }
    };

    // ============================================================
    // FUNDDEPOSIT EFFECT - SIRF 1 BAAR CALL HOGA
    // ============================================================
    useEffect(() => {
        if (!walletAddress || !regno) return;
        if (!isConfirmSuccess) return;

        // Agar FundDeposit already called hai toh return
        if (isFundDepositCalled) {
            return;
        }
        if (modalShownRef.current) {
            return;
        }

        setIsFundDepositCalled(true); // Mark as called
        callFundDepositAPI();

    }, [walletAddress, regno, isConfirmSuccess]);

    // ============================================================
    // FETCH WALLET ADDRESS
    // ============================================================
    useEffect(() => {
        const fetchAddress = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiClient.get(`/DepositReport/DepositAddress/${regno}`);
                if (response.data?.result === "true") {
                    const walletId = response.data.response?.walletid;
                    if (walletId && walletId !== 'null') {
                        setWalletAddress(walletId);
                    } else {
                        setError("No wallet address found");
                    }
                } else {
                    setError(response.data?.message || "Failed to fetch address");
                }
            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };
        fetchAddress();
    }, [regno]);

    // ============================================================
    // TIMER - CONFIRMDEPOSIT HAR 30 SECONDS PAR CALL HOGA
    // ============================================================
    useEffect(() => {
        let timer = null;

        if (isTimerRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    const newTime = prev - 1;

                    // 🔴 CONFIRM DEPOSIT - HAR 30 SECONDS PAR CALL
                    // 🔴 SIRF TAB JAB DEPOSIT CONFIRM NA HUA HO
                    if (
                        newTime % 30 === 0 &&
                        newTime < 300 &&
                        newTime > 0 &&
                        !isDepositConfirmedRef.current
                    ) {
                        confirmDeposit(false);
                    }

                    if (newTime <= 0) {
                        setIsTimerRunning(false);
                        setIsTimerComplete(true);
                        showTimerExpireModal();
                        return 0;
                    }
                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isTimerRunning, timeLeft]);

    // ============================================================
    // TIMER EXPIRE MODAL
    // ============================================================
    const showTimerExpireModal = () => {
        Swal.fire({
            icon: 'warning',
            title: 'Timer Expired!',
            text: 'Your timer has expired. Please refresh the page.',
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Refresh Page',
            backdrop: 'rgba(0,0,0,0.7)',
            zIndex: 9999999,
            width: '450px',
            padding: '2.5rem',
            allowOutsideClick: false,
            allowEscapeKey: false,
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload();
            }
        });
    };

    // ============================================================
    // SUCCESS MODAL - SIRF 1 BAAR DIKHEGA
    // ============================================================
    const showSuccessModal = (message) => {
        modalShownRef.current = true;
        setIsModalShown(true);

        Swal.fire({
            icon: 'success',
            title: 'Deposit Confirmed!',
            text: message || 'Your deposit has been successfully confirmed!',
            confirmButtonColor: '#28a745',
            confirmButtonText: 'OK, Got it!',
            backdrop: 'rgba(0,0,0,0.7)',
            zIndex: 9999999,
            width: '450px',
            padding: '2.5rem',
            allowOutsideClick: false,
            allowEscapeKey: false,
        }).then((result) => {
            if (result.isConfirmed) {
                setIsConfirmSuccess(false);
            }
        });
    };

    // ============================================================
    // CONFIRM DEPOSIT - HAR 30 SECONDS PAR CALL HOGA
    // 🔴 SIRF EK BAAR TRUE MILEGA, USKE BAAD CALL NAHI HOGA
    // ============================================================
    const confirmDeposit = async (isManual = false) => {
        // 🔴 Agar already confirmed hai toh API call mat karo
        if (isDepositConfirmedRef.current) {
            return;
        }

        try {
            const payload = {
                walletAddress: walletAddress,
                regno: parseInt(regno)
            };

            const response = await apiClient.post('/DepositReport/ConfirmDeposit', payload);

            // SIRF TRUE HONE PAR FUNDDEPOSIT CALL HOGA
            if (response.data?.result === "true" || response.data?.result === true) {
                // 🔴 Flag set karo - ab dobara API call nahi hogi
                isDepositConfirmedRef.current = true;

                setIsConfirmSuccess(true);
                await refreshData();
                return;
            }

        } catch (err) {
            console.error(err.response?.data?.message || err.message);
        }
    };

    // ============================================================
    // HELPER FUNCTIONS
    // ============================================================
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCopy = async () => {
        if (!walletAddress) return;
        try {
            await navigator.clipboard.writeText(walletAddress);
            toast.success("Address Copied!");
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = walletAddress;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            textArea.style.top = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success("Address Copied!");
        }
    };

    const handleShare = async () => {
        if (!walletAddress) {
            toast.error("No address to share");
            return;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Deposit Wallet',
                    text: `Wallet Address: ${walletAddress}`,
                    url: window.location.href
                });
            } catch (error) {
                if (error.name === 'AbortError') return;
                console.error('Share error:', error);
                toast.error("Share failed. Copying address instead...");
                handleCopy();
            }
        } else {
            toast.info("Share not available. Address copied!");
            handleCopy();
        }
    };

    const truncateAddress = (address) => {
        if (!address) return '';
        if (address.length <= 22) return address;
        return `${address.slice(0, 11)}...${address.slice(-11)}`;
    };

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <>
            <Toast />

            <div className="unique-df-main-wrapper">
                <div className="unique-df-card-container">

                    <div className="unique-df-top-header">
                        <div className="unique-df-header-left">
                            <div className="unique-df-wallet-bg btn-primary">
                                <Wallet size={24} color="white" fill="white" />
                            </div>
                            <div className="unique-df-header-texts">
                                <h2>Deposit Fund</h2>
                                <p>Scan the QR code or copy wallet address to deposit funds</p>
                            </div>
                        </div>
                        <Link to="/dashboard/FundDepositStatus" className="btn-primary gap-1 unique-df-history-btn">
                            <History size={18} />
                            <span>History</span>
                        </Link>
                    </div>

                    <div className="unique-df-content-body">

                        <div className="unique-df-qr-section">
                            <div className="unique-df-qr-frame">
                                {loading ? (
                                    <div className="unique-df-spinner"></div>
                                ) : walletAddress ? (
                                    <QRCodeSVG value={walletAddress} size={180} level="H" includeMargin={true} />
                                ) : (
                                    <div className="unique-df-error-msg">{error || "Address Not Found"}</div>
                                )}
                            </div>
                            <div className="unique-df-scan-pay-badge">
                                <Smartphone size={16} />
                                <span>Scan to Pay</span>
                            </div>
                        </div>

                        {walletAddress && (
                            <div className="unique-df-address-info-card">
                                <div className="unique-df-address-input-pill">
                                    <span className="unique-df-label">Wallet address</span>
                                    <span className="unique-df-address-text">{truncateAddress(walletAddress)}</span>
                                    <div className="unique-df-address-actions">
                                        <button
                                            className="unique-df-copy-icon-btn"
                                            onClick={handleShare}
                                            aria-label="Share"
                                            title="Share wallet address"
                                        >
                                            <Share2 size={18} />
                                        </button>
                                        <button
                                            className="unique-df-copy-icon-btn"
                                            onClick={handleCopy}
                                            aria-label="Copy"
                                            title="Copy wallet address"
                                        >
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="unique-df-confirm-container">
                                    {isTimerRunning && timeLeft > 0 && (
                                        <div className="unique-df-progress-bar">
                                            <div
                                                className="unique-df-progress-fill"
                                                style={{
                                                    width: `${((300 - timeLeft) / 300) * 100}%`,
                                                    backgroundColor: timeLeft > 60 ? '#10b981' : '#ef4444'
                                                }}
                                            ></div>
                                        </div>
                                    )}

                                    <button
                                        className={`btn-primary unique-df-confirm-btn ${confirmLoading ? 'loading' : ''}`}
                                        onClick={isTimerComplete ? () => {
                                            confirmDeposit(true);
                                        } : null}
                                        disabled={confirmLoading || (!isTimerComplete && isTimerRunning)}
                                        style={{
                                            cursor: isTimerComplete ? 'pointer' : 'default',
                                            opacity: isTimerComplete ? 1 : 0.8
                                        }}
                                    >
                                        <Clock size={20} />
                                        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                                            {formatTime(timeLeft)}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="unique-df-bottom-note">
                            <AlertCircle size={18} />
                            <p>Note: If your wallet balance is not updated immediately, please wait a few minutes and try again.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DepositFund;