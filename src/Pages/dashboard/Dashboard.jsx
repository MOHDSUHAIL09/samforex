import { useEffect, useState } from 'react';
import { FaCreditCard } from "react-icons/fa6";

import { GiProfit } from "react-icons/gi";
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import apexcoin from "../../assets/images/coins/apexcoin.png"
import Swal from 'sweetalert2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../api/apiClient';
import Marquee from './Marquee';
import Toast from '../../Componenets/ui/Toast';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const navigate = useNavigate();
    const { userData, refreshData , currentEarnings  } = useUser();
    //  Add this state at the top with other states
    const [hoveredIncome, setHoveredIncome] = useState(null);


    // Withdraw Modal States -  FIXED
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [payoutAmount, setPayoutAmount] = useState('');
    const [minimumWithdraw] = useState(10);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [apiBotStatus, setApiBotStatus] = useState();
    const [countdown, setCountdown] = useState("");
    const displayBalance = userData?.WorkingWallet || 0;
    const NameAppearOnCheque = userData?.NameAppearOncheque;
    // Add these states with other states
    const [showSelfPayoutModal, setShowSelfPayoutModal] = useState(false);
    const [selfPayoutAmount, setSelfPayoutAmount] = useState('');
    const [selfPayoutLoading, setSelfPayoutLoading] = useState(false);



    // Add these states at the top with other states
    const [showTokenPayoutModal, setShowTokenPayoutModal] = useState(false);
    const [tokenPayoutAmount, setTokenPayoutAmount] = useState('');
    const [tokenPayoutLoading, setTokenPayoutLoading] = useState(false);


    const loginId = sessionStorage.getItem("loginId");
    const regno = sessionStorage.getItem('Regno');

    // ============ SIRF RIGHT SIDE UPDATE - CHART STABLE ============
    const [price, setPrice] = useState(2.00);
    const [chartData, setChartData] = useState([]);
    const [labels, setLabels] = useState([]);
    const [priceChange, setPriceChange] = useState(0);
    const [previousPrice, setPreviousPrice] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const [baseApiPrice, setBaseApiPrice] = useState(0);
    const [isBotStarting, setIsBotStarting] = useState(false);


    //  Initialize chart with initial data
    useEffect(() => {
        const initialData = [8, 18, 12, 28, 20, 34, 26];
        const initialLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        setChartData(initialData);
        setLabels(initialLabels);
        setIsInitialized(true);

        // ✅ First API call - Real price fetch
        fetchLivePrice();
    }, []);



    // ✅ Generate random price between min (apiPrice - 20%) and max (apiPrice)
    const generateRandomPriceFromApi = (apiPrice) => {
        // 20% minus karo
        const minPrice = apiPrice - 0.5; // 20% kam
        const maxPrice = apiPrice; // API price (max)

        // Random price generate karo between min and max
        const randomValue = (Math.random() * (maxPrice - minPrice) + minPrice);
        return parseFloat(randomValue.toFixed(4));
    };

    // ✅ Generate chart data point
    const generateNewDataPoint = (currentPrice) => {
        const min = 5;
        const max = 40;
        const baseValue = currentPrice * 8;
        const variation = (Math.random() - 0.5) * 8;
        return Math.round(Math.max(5, Math.min(45, baseValue + variation)));
    };


    // ✅ Fetch real price from API
    const fetchLivePrice = async () => {
        try {
            const response = await apiClient.get('/Token/token-live-price');

            if (response.data?.result === "true" && response.data?.data?.length > 0) {
                const livePrice = parseFloat(response.data.data[0].tokenLivePrice);
                if (!isNaN(livePrice) && livePrice > 0) {
                    // ✅ API se real price mil gayi
                    setBaseApiPrice(livePrice);

                    // ✅ API price ke 80% se 100% ke beech random price generate karo
                    const randomPrice = generateRandomPriceFromApi(livePrice);
                    updatePrice(randomPrice);
                    return randomPrice;
                }
            }
            // ✅ Agar API fail ho toh default 2.00 - 2.50 ke beech random
            const fallbackPrice = generateRandomPriceFallback();
            updatePrice(fallbackPrice);
            return fallbackPrice;
        } catch (error) {
            console.error('Error fetching live price:', error);
            // ✅ Error pe fallback random
            const fallbackPrice = generateRandomPriceFallback();
            updatePrice(fallbackPrice);
            return fallbackPrice;
        }
    };

    // ✅ Fallback random price (2.00 - 2.50)
    const generateRandomPriceFallback = () => {
        const min = 2.00;
        const max = 2.50;
        const randomValue = (Math.random() * (max - min) + min);
        return parseFloat(randomValue.toFixed(4));
    };

    // ✅ Update price and chart
    const updatePrice = (newPrice) => {
        // Price change calculate
        const change = ((newPrice - previousPrice) / previousPrice * 100);
        setPriceChange(change);
        setPreviousPrice(newPrice);
        setPrice(newPrice);

        // Chart update
        setChartData(prevData => {
            const newData = [...prevData];
            newData.push(generateNewDataPoint(newPrice));
            if (newData.length > 20) {
                newData.shift();
            }
            return newData;
        });

        setLabels(prevLabels => {
            const newLabels = [...prevLabels];
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            newLabels.push(timeStr);
            if (newLabels.length > 20) {
                newLabels.shift();
            }
            return newLabels;
        });
    };

    // ✅ Initialize chart with initial data
    useEffect(() => {
        const initialData = [8, 18, 12, 28, 20, 34, 26];
        const initialLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        setChartData(initialData);
        setLabels(initialLabels);
        setIsInitialized(true);

        // ✅ First call - API se fetch
        fetchLivePrice();
    }, []);



    const handleDashboardStartBot = async () => {
        if (apiBotStatus === 0) {
            toast.warning('Bot is already running!');
            return;
        }

        const investAmount = parseFloat(userData?.Invest) || 0;
        if (investAmount <= 0) {
            toast.error(' Please invest first to start bot!');
            return;
        }

        // ✅ RANDOM CURRENCY
        const currencies = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'];
        const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
        const defaultSlot = 24;

        // ✅ DIRECT MAPPING - Bina getCryptoConfig ke
        const binanceSymbols = {
            'BTC': 'BTCUSDT',
            'ETH': 'ETHUSDT',
            'BNB': 'BNBUSDT',
            'SOL': 'SOLUSDT',
            'XRP': 'XRPUSDT'
        };

        const binanceSymbol = binanceSymbols[randomCurrency];

        // ✅ FETCH PRICE
        let currencyRate = 0;
        try {
            const response = await fetch(
                `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`
            );
            if (response.ok) {
                const data = await response.json();
                currencyRate = parseFloat(data.price);
            } else {
                currencyRate = 50000;
            }
        } catch (error) {
            currencyRate = 50000;
        }

        // ✅ PAYLOAD
        const payload = {
            regno: parseInt(regno),
            betAmount: investAmount,
            currency: randomCurrency.toLowerCase(),
            currencyRate: parseFloat(currencyRate.toFixed(4)),
            slot: defaultSlot
        };

        setIsBotStarting(true);
        try {
            const response = await apiClient.post('/Trading/BotTrading', payload);

            if (response.data?.result === "true") {
                toast.success(`Bot started successfully with ${randomCurrency}!`);
                await refreshData();
                await fetchBotStatus();
                setApiBotStatus(0);
            } else {
                toast.error(response.data?.message || ' Failed to start bot');
            }
        } catch (error) {
            console.error(' Error:', error);
            if (error.response) {
                toast.error(error.response.data?.message || ' Failed to start bot');
            } else {
                toast.error(' Network error. Please try again.');
            }
        } finally {
            setIsBotStarting(false);
        }
    };

    // ✅ Auto update every 5 seconds
    useEffect(() => {
        if (!isInitialized) return;

        const interval = setInterval(() => {
            fetchLivePrice();
        }, 5000);

        return () => clearInterval(interval);
    }, [price, previousPrice, isInitialized]);

    //  Token Payout - Complete Function with API Call
    const handleTokenPayoutSubmit = async () => {
        const amountNum = parseFloat(tokenPayoutAmount);

        //  Validations
        if (!tokenPayoutAmount || isNaN(amountNum) || amountNum <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Amount!',
                text: 'Please enter a valid token amount.',
                confirmButtonColor: '#667eea',
                confirmButtonText: 'OK',
            });
            return;
        }

        if (amountNum < 10) {
            Swal.fire({
                icon: 'warning',
                title: 'Minimum Withdrawal 10 Tokens!',
                text: `You entered ${tokenPayoutAmount} tokens. Minimum withdrawal is 10 tokens.`,
                confirmButtonColor: '#667eea',
                confirmButtonText: 'OK, Got it!',
            });
            return;
        }

        const availableTokens = Number(userData?.TotalEarnTokenInWallet) || 0;
        if (amountNum > availableTokens) {
            Swal.fire({
                icon: 'error',
                title: ' Insufficient Tokens!',
                text: `Available tokens: ${availableTokens}. You entered ${amountNum}.`,
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK',
            });
            return;
        }

        //  OTP Verified Check
        if (!otpVerified) {
            Swal.fire({
                icon: 'info',
                title: 'OTP Required!',
                text: 'Please verify OTP first before proceeding.',
                confirmButtonColor: '#667eea',
                confirmButtonText: 'Verify OTP',
            });
            return;
        }

        setTokenPayoutLoading(true);

        try {
            const payload = {
                regno: parseInt(regno),
                amount: amountNum,
                payMode: "usdt"
            };
            //  API CALL - POST /Token/TokenPayoutRequest
            const response = await apiClient.post('/Token/TokenPayoutRequest', payload);
            //  Check response - result can be boolean or string
            if (response.data?.result === true || response.data?.result === "true") {
                Swal.fire({
                    icon: 'success',
                    title: ' Withdrawal Successful!',
                    text: response.data?.message || 'Token withdrawal request submitted successfully!',
                    confirmButtonColor: '#28a745',
                    confirmButtonText: 'OK',
                    timer: 3000,
                    timerProgressBar: true,
                });
                //  Close modal and reset
                setShowTokenPayoutModal(false);
                setTokenPayoutAmount('');
                setOtp('');
                setOtpVerified(false);
                setOtpSent(false);
                await refreshData();

            } else {
                //  FAILURE
                const errorMsg = response.data?.message || 'Withdrawal failed';
                Swal.fire({
                    icon: 'error',
                    title: ' Withdrawal Failed!',
                    text: errorMsg,
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error(' Token Payout Error:', error);
            console.error(' Error Response:', error.response);

            let errorMsg = 'Server error. Please try again.';
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.response?.data?.response) {
                errorMsg = error.response.data.response;
            } else if (error.message) {
                errorMsg = error.message;
            }

            Swal.fire({
                icon: 'error',
                title: 'Server Error!',
                text: errorMsg,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Try Again',
            });
        } finally {
            setTokenPayoutLoading(false);
        }
    };
    //  Open Token Payout Modal (Validation Only)
    const handleTokenPayout = () => {
        const amountNum = parseFloat(tokenPayoutAmount);

        if (!tokenPayoutAmount || isNaN(amountNum) || amountNum <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Amount!',
                text: 'Please enter a valid token amount.',
                confirmButtonColor: '#667eea',
                confirmButtonText: 'OK',
            });
            return;
        }

        if (amountNum < 10) {
            Swal.fire({
                icon: 'warning',
                title: 'Minimum Withdrawal 10 Tokens!',
                text: `You entered ${tokenPayoutAmount} tokens. Minimum withdrawal is 10 tokens.`,
                confirmButtonColor: '#667eea',
                confirmButtonText: 'OK, Got it!',
            });
            return;
        }

        const availableTokens = Number(userData?.TotalEarnTokenInWallet) || 0;
        if (amountNum > availableTokens) {
            Swal.fire({
                icon: 'error',
                title: ' Insufficient Tokens!',
                text: `Available tokens: ${availableTokens}. You entered ${amountNum}.`,
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK',
            });
            return;
        }

        //  All validations passed - open modal
        setShowTokenPayoutModal(true);
    };

  // BOT start in Dashboard direct
    const fetchBotStatus = async () => {
        try {
            setLoading(true);
            const regno = sessionStorage.getItem('Regno');


            const response = await apiClient.get(`/Trading/BotStatus?regno=${regno}`);


            if (response.data?.result === "true") {
                const status = response.data?.response?.status;
                await refreshData();
                setApiBotStatus(status);
                return status;
            }
            setApiBotStatus(1);
            return 1;
        } catch (error) {
            console.error(" Error fetching bot status:", error);
            setApiBotStatus(1);
            return 1;
        } finally {
            setLoading(false);
        }
    };

    //  2. FETCH STATUS ON MOUNT
    useEffect(() => {
        fetchBotStatus();
    }, []);

    //  3. COUNTDOWN TIMER - Only when status = 0 (Running)

    useEffect(() => {
        const targetTime = new Date(
            userData.status.replace(" ", "T") + "+04:00"
        ).getTime();

        const timer = setInterval(() => {
            const diff = targetTime - Date.now();

            if (diff <= 0) {
                setCountdown("00H : 00M : 00S");
                clearInterval(timer);
                //  Auto refresh status when timer expires
                fetchBotStatus();
                return;
            }

            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            setCountdown(
                `${String(hours).padStart(2, "0")}H : ${String(minutes).padStart(2, "0")}M : ${String(seconds).padStart(2, "0")}S`
            );
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [userData?.status, apiBotStatus]);

    
    // Send OTP - SIRF API KA MESSAGE
    const handleSendOTP = async () => {
        try {
            setLoading(true);
            setOtpVerified(false);

            const url = `/Auth/genrate-otp?loginid=${loginId}&regno=${regno}`;
            const response = await apiClient.post(url);
            // SIRF API KA MESSAGE DIKHAO
            if (response.data.result === "true") {
                toast.success(response.data.message);
                setOtpSent(true);
            } else {
                toast.error(response.data.message || 'Failed to send OTP');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    // Verify OTP - SIRF API KA MESSAGE
    const handleVerifyOTP = async () => {
        try {
            setLoading(true);

            const response = await apiClient.post('/Auth/verify-otp', null, {
                params: {
                    loginid: loginId,
                    regno: regno,
                    otp: otp
                }
            });
            // CHECK KARO - result string hai ya boolean
            const isSuccess = response.data?.result === "true" || response.data?.result === true;

            if (isSuccess) {
                // SUCCESS - API ka exact message
                const successMsg = response.data?.message || 'OTP verified successfully!';
                toast.success(successMsg);
                setOtpVerified(true);
                setOtpSent(true);
            } else {
                //  FAILURE - API ka exact message
                const errorMsg = response.data?.message || 'Invalid OTP. Please try again.';
                toast.error(errorMsg);
                setOtp('');
            }
        } catch (error) {
            console.error(" API Error:", error);
            console.error(" Error Response:", error.response);

            // Error response se message nikaalo
            let errorMsg = 'Network error. Please try again.';
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.response?.data?.Message) {
                errorMsg = error.response.data.Message;
            }
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Self Trading Payout Function - FIXED
    const handleSelfTradingPayout = async () => {
        const amountNum = parseFloat(selfPayoutAmount);

        if (!selfPayoutAmount || isNaN(amountNum) || amountNum <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (amountNum < 10) {
            Swal.fire({
                icon: 'warning',
                title: 'Minimum Withdrawal $10!',
                text: `You entered $${selfPayoutAmount || 0}. Minimum withdrawal amount is $10.`,
                confirmButtonColor: '#667eea',
                confirmButtonText: 'OK, Got it!',
                backdrop: 'rgba(0,0,0,0.4)',
            });
            return;
        }

        if (amountNum > displayBalance) {
            Swal.fire({
                icon: 'error',
                title: 'Insufficient Balance!',
                text: `Available balance is $${displayBalance.toFixed(2)}. Please enter a valid amount.`,
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK',
                backdrop: 'rgba(0,0,0,0.4)',
            });
            return;
        }

        // ✅ USE MAIN otpVerified
        if (!otpVerified) {
            Swal.fire({
                icon: 'info',
                title: 'OTP Required!',
                text: 'Please verify OTP first before proceeding with payout.',
                confirmButtonColor: '#667eea',
                confirmButtonText: 'Verify OTP',
                backdrop: 'rgba(0,0,0,0.4)',
            });
            return;
        }

        setSelfPayoutLoading(true);
        try {
            const response = await apiClient.post('/Trading/TradingPayout', {
                regno: parseInt(regno),
                amount: amountNum
            });

            if (response.data?.result === 'true') {
                Swal.fire({
                    icon: 'success',
                    title: '✅ Payout Successful!',
                    text: response.data?.message || 'Payout request submitted successfully!',
                    timer: 3000,
                    showConfirmButton: true,
                    confirmButtonColor: '#28a745',
                    backdrop: 'rgba(0,0,0,0.4)',
                });
                resetSelfPayoutModal();
                await refreshData();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Payout Failed!',
                    text: response.data?.message || 'Payout failed. Please try again.',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Try Again',
                    backdrop: 'rgba(0,0,0,0.4)',
                });
            }
        } catch (error) {
            console.error('Payout error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Server error. Please try again.',
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK',
                backdrop: 'rgba(0,0,0,0.4)',
            });
        } finally {
            setSelfPayoutLoading(false);
        }
    };

    // ✅ Self Trading Payout - Reset Modal (Clean)
    const resetSelfPayoutModal = () => {
        setSelfPayoutAmount('');
        setSelfPayoutLoading(false);
        setShowSelfPayoutModal(false);
    };




    // Dashboard.js
    const goToStatement = (type) => {
        const encodedType = encodeURIComponent(type);
        navigate(`/dashboard/IncomeReport?type=${encodedType}`);
    };

    const goToHistory = (type) => {
        const encodedType = encodeURIComponent(type);
        navigate(`/dashboard/TokenMiningIncomeHistory?type=${encodedType}`);
    };



    // ✅ Income Payout
    const handleWithdraw = async () => {
        const amountNum = parseFloat(withdrawAmount);

        // Validations
        if (!withdrawAmount || isNaN(amountNum) || amountNum <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (amountNum < minimumWithdraw) {
            Swal.fire({
                icon: 'warning',
                title: 'Minimum Withdrawal $10!',
                text: `You entered $${withdrawAmount}. Minimum withdrawal amount is $10.`,
                confirmButtonColor: '#667eea',
                confirmButtonText: 'OK, Got it!',
                backdrop: 'rgba(0,0,0,0.6)',
                zIndex: 9999999,
            });
            return;
        }
        if (amountNum > displayBalance) {
            Swal.fire({
                icon: 'error',
                title: 'Insufficient Balance!',
                text: `Available balance is $${displayBalance.toFixed(2)}. Please enter a valid amount.`,
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK',
                backdrop: 'rgba(0,0,0,0.6)',
                zIndex: 9999999,
            });
            return;
        }

        setWithdrawLoading(true);
        try {
            const payload = {
                regNo: parseInt(regno),
                amount: amountNum,
                payMode: "usdt"
            };

            const response = await apiClient.post('/IncomePayout/WithdrawRequest', payload);

            if (response.data?.result === "true") {
                // ✅ SUCCESS - SweetAlert
                Swal.fire({
                    icon: 'success',
                    title: '✅ Withdrawal Successful!',
                    text: response.data?.message || 'Withdrawal request submitted successfully!',
                    confirmButtonColor: '#28a745',
                    confirmButtonText: 'OK',
                    timer: 3000,
                    timerProgressBar: true,
                    backdrop: 'rgba(0,0,0,0.6)',
                    zIndex: 9999999,
                });

                // ✅ Close modal and reset
                setShowWithdrawModal(false);
                setWithdrawAmount('');
                setOtp('');
                setOtpSent(false);
                setOtpVerified(false);
                await refreshData();

            } else {
                // FAILURE - API ka exact message
                const errorMsg = response.data?.message || 'Withdrawal failed';
                Swal.fire({
                    icon: 'error',
                    title: 'Withdrawal Failed!',
                    text: errorMsg,
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'OK',
                    backdrop: 'rgba(0,0,0,0.6)',
                    zIndex: 9999999,
                });
            }
        } catch (error) {
            console.error('Withdrawal error:', error);

            let errorMsg = 'Server error. Please try again.';
            if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMsg = error.response.data.error;
            } else if (error.message) {
                errorMsg = error.message;
            }

            Swal.fire({
                icon: 'error',
                title: 'Server Error!',
                text: errorMsg,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Try Again',
                backdrop: 'rgba(0,0,0,0.6)',
                zIndex: 9999999,
            });
        } finally {
            setWithdrawLoading(false);
        }
    };


    // Self Trading Payout - Fixed
    const handleSelfPayoutButtonClick = () => {
        const amountNum = parseFloat(selfPayoutAmount);

        //  Check if amount is valid
        if (!selfPayoutAmount || isNaN(amountNum) || amountNum <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Amount!',
                text: 'Please enter a valid amount.',
                confirmButtonColor: '#667eea',
                confirmButtonText: 'OK',
            });
            return;
        }

        //  Check minimum amount
        if (amountNum < 10) {
            Swal.fire({
                icon: 'warning',
                title: 'Minimum Withdrawal $10!',
                text: `You entered $${selfPayoutAmount}. Minimum withdrawal amount is $10.`,
                confirmButtonColor: '#667eea',
                confirmButtonText: 'OK, Got it!',
            });
            return;
        }

        //  Check balance
        const availableBalance = Number(userData?.SelfTrade) || 0;
        if (amountNum > availableBalance) {
            Swal.fire({
                icon: 'error',
                title: ' Insufficient Balance!',
                text: `Available balance is $${availableBalance.toFixed(2)}. You entered $${amountNum.toFixed(2)}.`,
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK',
            });
            return;
        }

        //  Sab sahi hai to modal open karo
        setShowSelfPayoutModal(true);
    };


    const handlePayoutClick = () => {
        const amountNum = parseFloat(payoutAmount);

        //  Check if amount is valid
        if (!payoutAmount || isNaN(amountNum) || amountNum <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Amount!',
                text: 'Please enter a valid amount.',
                confirmButtonColor: '#667eea',
                confirmButtonText: 'OK',
            });
            return;
        }

        //  Check minimum amount
        if (amountNum < 10) {
            Swal.fire({
                icon: 'warning',
                title: 'Minimum Withdrawal $10!',
                text: `You entered $${payoutAmount}. Minimum withdrawal amount is $10.`,
                confirmButtonColor: '#667eea',
                confirmButtonText: 'OK, Got it!',
            });
            return;
        }

        //  Check balance
        const availableBalance = Number(userData?.WorkingWallet) || 0;
        if (amountNum > availableBalance) {
            Swal.fire({
                icon: 'error',
                title: ' Insufficient Balance!',
                text: `Available balance is $${availableBalance.toFixed(2)}. You entered $${amountNum.toFixed(2)}.`,
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK',
            });
            return;
        }

        //  Sab sahi hai to modal open karo
        setWithdrawAmount(payoutAmount);
        setShowWithdrawModal(true);
    };
    const resetWithdrawModal = () => {
        setWithdrawAmount("");
        setOtp("");
        setOtpSent(false);
        setOtpVerified(false);
        setLoading(false);
        setWithdrawLoading(false);
        setShowTokenPayoutModal(false);
    };


    return (
        <>
            <Toast />
            <div className="container-fluid">
                <div
                    className="card01 mb-2"
                    style={{
                        borderRadius: "8px",
                        border: "1px solid #f1f1f1",
                        overflow: "hidden",
                    }}
                >
                    <Marquee />
                </div>

                {/* whatsapp contact */}
                {/* <div className="whatsapp-float">
           
                    <div className="bubble-ring ring-1"></div>
                    <div className="bubble-ring ring-2"></div>
                    <div className="bubble-ring ring-3"></div>
                    <a
                        href="https://wa.me/447400402001"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whatsapp-btn"
                        aria-label="Chat on WhatsApp"
                    >
                        <FaWhatsapp />
                    </a>
                </div> */}
                <div className="row">
                    {/* Welcome Card */}
                    <div className="col-12 col-lg-8 d-flex align-items-stretch">
                        <div className="card w-100 bg-primary-subtle overflow-hidden shadow-none">
                            <div className="card-body02 position-relative">
                                <div className="row">
                                    <div className="col-12 col-sm-7">
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <div className="d-flex">
                                                <div className="rounded-circle overflow-hidden me-6 flex-shrink-0">
                                                    <img
                                                        src="https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/profile/user-1.jpg"
                                                        alt="profile"
                                                        width="40"
                                                        height="40"
                                                    />
                                                </div>
                                                <h5 className="fw-semibold mt-0 mt-md-2 fs-5 fs-sm-3">
                                                    Welcome back <span style={{ color: "#04832f" }}>{userData?.loginid}</span>
                                                </h5>
                                            </div>
                                            <button
                                                className="invite-btn btn d-block d-sm-none"
                                                style={{
                                                    backgroundColor: Number(userData?.kid) > 0 ? "#04832f" : "#dc3545",
                                                    color: "#fff",
                                                    border: "none",
                                                    padding: "6px 16px",
                                                    borderRadius: "6px",
                                                    fontSize: "13px",
                                                    fontWeight: "500",
                                                }}
                                            >
                                                {Number(userData?.kid) > 0 ? "Active" : "Inactive"}
                                            </button>
                                        </div>

                                        <div className='mt-4'>
                                            <div className="row g-2">
                                                <div className="col-4">
                                                    <div className="card01 border-0 shadow-sm">
                                                        <Link to='/dashboard/DepositHistory' className="text-decoration-none">
                                                            <div className="card-body01 p-2 text-center">
                                                                <p className="income-text  mb-1 small" style={{color: "#989595"}}>Deposit Fund</p>
                                                                <h6 className="income-balance mb-0 fw-bold text-dark">
                                                                    ${userData?.Depositfund || "0.00"}
                                                                </h6>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                </div>

                                                <div className="col-4">
                                                    <div className="card01 border-0 shadow-sm">
                                                        <Link to='/dashboard/InvestmentHistory' className="text-decoration-none">
                                                            <div className="card-body01 p-2 text-center">
                                                                <p className="income-text  mb-1 small" style={{color: "#989595"}}>Investment</p>
                                                                <h6 className="income-balance mb-0 fw-bold text-dark">
                                                                    ${userData?.Invest?.toFixed(2) || '0.00'}
                                                                </h6>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                </div>

                                                <div className="col-4">
                                                    <div className="card01 border-0 shadow-sm">
                                                        <Link to='/dashboard/IncomeReport' className="text-decoration-none">
                                                            <div className="card-body01 p-2 text-center">
                                                                <p className="income-text  mb-1 small" style={{color: "#989595"}}>Total Income</p>
                                                                <h6 className="income-balance mb-0 fw-bold">
                                                                    ${userData?.TotalIncome?.toFixed(2) || '0.00'}
                                                                </h6>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Remaining Days Countdown Timer */}
                                            <div className="row g-2 mt-1">
                                                <div className="col-6">
                                                    <div className="countdown-box text-center p-1">
                                                        <div className="small fw-semibold">
                                                            {apiBotStatus === 0 && ("BOT EXPIRE")}
                                                            {/* BOT EXPIRE */}
                                                        </div>

                                                        {/* ✅ Loading State - Same Size Maintain */}
                                                        {loading ? (
                                                            <div className="left-timer">
                                                                <span
                                                                    className="spinner-border"
                                                                    role="status"
                                                                    style={{
                                                                        width: '38px',
                                                                        height: '38px',
                                                                        borderWidth: '4px'
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : apiBotStatus === 0 ? (
                                                            /* ✅ Timer */
                                                            <div className="left-timer fw-bold">
                                                                {countdown || "00H : 00M : 00S"}
                                                            </div>
                                                        ) : (
                                                            /* ✅ Start Button */
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={handleDashboardStartBot}  // ✅ Sahi hai
                                                                disabled={isBotStarting}
                                                            >
                                                                {isBotStarting ? 'Starting...' : 'Start Bot'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="countdown-box text-center p-1">
                                                        <div className="small fw-semibold ">
                                                            RANK
                                                        </div>
                                                        <div className="left-timer">
                                                            {userData?.Ranks || "N/A"}
                                                        </div>
                                                    </div>
                                                </div>


                                                 {/* <div className="col-6">
                                                    <div className="countdown-box text-center p-1">
                                                        <div className="small fw-semibold ">
                                                            BOT-1
                                                        </div>
                                                        <div className="left-timer">
                                                            {currentEarnings || "00"} / 2.5%
                                                        </div>
                                                    </div>
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12 col-sm-5 mt-4 mt-sm-0">
                                        <div className="welcome-bg-img text-center text-sm-end position-relative">
                                            <button
                                                className="btn d-none d-sm-inline-block position-absolute"
                                                style={{
                                                    backgroundColor: Number(userData?.kid) > 0 ? "#04832f" : "#dc3545",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "8px 24px",
                                                    borderRadius: "6px",
                                                    fontSize: "14px",
                                                    fontWeight: "500",
                                                    top: "-5px",
                                                    right: "0",
                                                    zIndex: 1,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        color: "#ffffff",
                                                        textShadow: "0 0 5px rgba(179, 62, 62, 0.8)",
                                                        fontWeight: "700",
                                                    }}
                                                >
                                                    {Number(userData?.kid) > 0 ? "Active" : "Inactive"}
                                                </span>
                                            </button>
                                            <img
                                                src="https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/backgrounds/welcome-bg.svg"
                                                alt="welcome"
                                                className="img-fluid"
                                                style={{ maxWidth: "100%", height: "auto", marginTop: "5px" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Income Wallet - Fully Responsive */}
                    <div className="col-md-6 col-lg-4 d-flex align-items-stretch">
                        <div className="card w-100">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h5 className="fw-bold mb-0" style={{ fontSize: "clamp(16px, 2vw, 20px)" }}>
                                        Income Wallet
                                    </h5>
                                </div>

                                <div className="row g-2 align-items-center">
                                    {/* Left - Chart */}
                                    <div className="col-5 col-sm-5 col-md-6">
                                        <div style={{
                                            height: "clamp(100px, 15vw, 130px)",
                                            position: "relative",
                                            width: "100%"
                                        }}>
                                            {(() => {
                                                const categories = [
                                                    { label: "Bot Income", value: Number(userData?.AIBOTIncome) || 0, color: "#5D87FF", hoverColor: "#2B5BD9" },
                                                    { label: "Trading Level Bonus", value: Number(userData?.TradingLevelIncome) || 0, color: "#28a745", hoverColor: "#1A7A32" },
                                                    { label: "Sponsor Bonus", value: Number(userData?.SponsorIncome) || 0, color: "#FFB74D", hoverColor: "#E67E22" },
                                                    { label: "Salary", value: Number(userData?.Salary) || 0, color: "#FF6B6B", hoverColor: "#C0392B" },
                                                    { label: "Reward", value: Number(userData?.Reward) || 0, color: "#9C27B0", hoverColor: "#6A1B9A" }
                                                ];

                                                const filteredCategories = categories.filter(c => c.value > 0);

                                                //  Agar koi income nahi hai toh empty chart dikhao
                                                if (filteredCategories.length === 0) {
                                                    return (
                                                        <>
                                                            <Doughnut
                                                                data={{
                                                                    labels: ["No Income"],
                                                                    datasets: [{
                                                                        data: [100],
                                                                        backgroundColor: ["#E0E0E0"],
                                                                        borderWidth: 0,
                                                                        cutout: "75%"
                                                                    }]
                                                                }}
                                                                options={{
                                                                    responsive: true,
                                                                    maintainAspectRatio: false,
                                                                    plugins: {
                                                                        legend: { display: false },
                                                                        tooltip: { enabled: false }
                                                                    }
                                                                }}
                                                            />
                                                            <div style={{
                                                                position: "absolute",
                                                                top: "50%",
                                                                left: "50%",
                                                                transform: "translate(-50%, -50%)",
                                                                textAlign: "center",
                                                                pointerEvents: 'none',
                                                                zIndex: 1
                                                            }}>
                                                                <h6 className="fw-bold mb-0" style={{
                                                                    fontSize: "clamp(11px, 1.2vw, 14px)",
                                                                    color: "#999"
                                                                }}>
                                                                    $0.00
                                                                </h6>
                                                                <small className="" style={{ fontSize: "clamp(7px, 0.8vw, 9px)" }}>
                                                                    No Income
                                                                </small>
                                                            </div>
                                                        </>
                                                    );
                                                }

                                                const getColors = () => {
                                                    return filteredCategories.map(c => {
                                                        if (hoveredIncome && hoveredIncome.label === c.label) {
                                                            return c.hoverColor || c.color;
                                                        }
                                                        if (hoveredIncome) {
                                                            return c.color + '40';
                                                        }
                                                        return c.color;
                                                    });
                                                };

                                                return (
                                                    <>
                                                        <Doughnut
                                                            data={{
                                                                labels: filteredCategories.map(c => c.label),
                                                                datasets: [{
                                                                    data: filteredCategories.map(c => c.value),
                                                                    backgroundColor: getColors(),
                                                                    borderColor: hoveredIncome ? '#ffffff' : 'transparent',
                                                                    borderWidth: hoveredIncome ? 2 : 0,
                                                                    cutout: "75%"
                                                                }]
                                                            }}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                plugins: {
                                                                    legend: { display: false },
                                                                    tooltip: {
                                                                        backgroundColor: "rgba(0,0,0,0.85)",
                                                                        titleColor: "#ffffff",
                                                                        bodyColor: "#ffffff",
                                                                        padding: 10,
                                                                        cornerRadius: 6,
                                                                        titleFont: { size: 12, weight: 'bold' },
                                                                        bodyFont: { size: 11 },
                                                                        callbacks: {
                                                                            label: function (context) {
                                                                                const value = context.parsed || 0;
                                                                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                                                                return `💰 $${value.toFixed(2)} (${percentage}%)`;
                                                                            },
                                                                            title: function (context) {
                                                                                return context[0].label;
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <div style={{
                                                            position: "absolute",
                                                            top: "50%",
                                                            left: "50%",
                                                            transform: "translate(-50%, -50%)",
                                                            textAlign: "center",
                                                            pointerEvents: 'none',
                                                            zIndex: 1
                                                        }}>
                                                            <h6 className="fw-bold mb-0" style={{
                                                                fontSize: "clamp(11px, 1.2vw, 14px)",
                                                                color: "#5A6A85"
                                                            }}>
                                                                ${Number(userData?.TotalIncome || 0).toFixed(2)}
                                                            </h6>
                                                            <small className="" style={{ fontSize: "clamp(7px, 0.8vw, 9px)" }}>
                                                                Total Income
                                                            </small>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Right - Income List */}
                                    <div className="col-7 col-sm-7 col-md-6">
                                        <div className="d-flex flex-column gap-1">
                                            {(() => {
                                                const categories = [
                                                    { label: "Bot Income", value: Number(userData?.AIBOTIncome) || 0, color: "#5D87FF" },
                                                    { label: "Trading Level Bonus", value: Number(userData?.TradingLevelIncome) || 0, color: "#28a745" },
                                                    { label: "Sponsor Bonus", value: Number(userData?.SponsorIncome) || 0, color: "#FFB74D" },
                                                    { label: "Salary", value: Number(userData?.Salary) || 0, color: "#FF6B6B" },
                                                    { label: "Reward", value: Number(userData?.Reward) || 0, color: "#9C27B0" }
                                                ];

                                                return categories.map((cat, index) => {
                                                    const isHovered = hoveredIncome && hoveredIncome.label === cat.label;
                                                    const hasValue = cat.value > 0;

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="d-flex align-items-center justify-content-between"
                                                            style={{
                                                                padding: "2px 6px",
                                                                borderRadius: "4px",
                                                                background: isHovered ? cat.color + '25' : 'transparent',
                                                                border: isHovered ? `2px solid ${cat.color}` : '1px solid transparent',
                                                                cursor: hasValue ? 'pointer' : 'default',
                                                                transition: 'all 0.3s ease',
                                                                opacity: hoveredIncome && !isHovered ? 0.4 : 1,
                                                                pointerEvents: hasValue ? 'auto' : 'none'
                                                            }}
                                                            onMouseEnter={() => {
                                                                if (hasValue) setHoveredIncome(cat);
                                                            }}
                                                            onMouseLeave={() => {
                                                                setHoveredIncome(null);
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-center gap-1">
                                                                <span style={{
                                                                    width: "clamp(6px, 0.8vw, 10px)",
                                                                    height: "clamp(6px, 0.8vw, 10px)",
                                                                    borderRadius: "2px",
                                                                    backgroundColor: cat.color,
                                                                    display: "inline-block",
                                                                    opacity: hasValue ? 1 : 0.3,
                                                                    transition: 'all 0.3s ease',
                                                                    transform: isHovered ? 'scale(1.3)' : 'scale(1)'
                                                                }}></span>
                                                                <span style={{
                                                                    fontSize: "clamp(8px, 0.9vw, 11px)",
                                                                    color: isHovered ? cat.color : (hasValue ? '#555' : '#bbb'),
                                                                    fontWeight: isHovered ? '700' : (hasValue ? '500' : '400'),
                                                                    whiteSpace: 'nowrap',
                                                                    transition: 'all 0.3s ease'
                                                                }}>
                                                                    {cat.label}
                                                                </span>
                                                            </div>
                                                            <span style={{
                                                                fontSize: "clamp(8px, 0.9vw, 11px)",
                                                                fontWeight: isHovered ? '700' : '600',
                                                                color: isHovered ? cat.color : (hasValue ? '#333' : '#bbb'),
                                                                transition: 'all 0.3s ease'
                                                            }}>
                                                                ${cat.value.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                      </div>




  <div className='row'>
                    <div className="col-12 col-lg-8">
                        <div className="row g-2">

                            {/* Card 1 - BOT INCOME */}
                            <div className="col-6 col-lg-4 d-flex align-items-stretch">
                                <div className="card01 w-100 border-0 shadow-sm" style={{ cursor: "pointer" }} onClick={() => goToStatement("AI Bot Income")}>
                                    <div className="card-body02 bonus-card p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <p className=" mb-1">Bot Income</p>
                                                <div className="amount-report">
                                                    ${userData?.AIBOTIncome?.toLocaleString() || '0.00'}
                                                </div>
                                            </div>
                                            <div className="p-2 bg-primary-subtle rounded-2">
                                                <i class="ti ti-bot-id"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2 - Trading Level Bonus */}
                            <div className="col-6 col-lg-4 d-flex align-items-stretch">
                                <div className="card01 w-100 border-0 shadow-sm" style={{ cursor: "pointer" }} onClick={() => goToStatement("Trading Level Bonus")}>
                                    <div className="card-body02 bonus-card01 p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <p className=" mb-1">Trading Level Bonus</p>
                                                <h5 className="fw-bold mb-0 amount-report">
                                                    ${userData?.TradingLevelIncome?.toLocaleString() || '0.00'}
                                                </h5>
                                            </div>
                                            <div className="p-2 bg-success-subtle rounded-2">
                                                <i class="ti ti-brand-vinted"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3 - Direct Income */}
                            <div className="col-12 col-lg-4 col-md-12 d-flex align-items-stretch">
                                <div className="card01 w-100 border-0 shadow-sm" style={{ cursor: "pointer" }} onClick={() => goToStatement("Sponsor Bonus")}>
                                    <div className="card-body02 bonus-card p-3">
                                        <div className="d-flex  justify-content-between align-items-start mb-2">
                                            <div>
                                                <p className=" mb-1">Sponsor Bonus</p>
                                                <h5 className="fw-bold mb-0 amount-report">
                                                    ${userData?.SponsorIncome?.toLocaleString() || '0.00'}
                                                </h5>
                                            </div>
                                            <div className="p-2 bg-info-subtle rounded-2">
                                                <i class="ti ti-fidget-spinner"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Row 2 - 3 Cards (Salary, Reward, APEX Mining) */}
                        <div className="row g-2 mt-1">

                            {/* Card 4 - Salary */}
                            <div className="col-6 col-lg-4 d-flex align-items-stretch">
                                <div className="card01 w-100 border-0 shadow-sm" style={{ cursor: "pointer" }} onClick={() => goToStatement("Salary")}>
                                    <div className="card-body02 bonus-card01 p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="text-decoration-none w-100">
                                                <div>
                                                    <p className=" mb-1">Salary</p>
                                                    <h5 className="fw-bold mb-0 amount-report">
                                                        ${userData?.Salary?.toLocaleString() || '0.00'}
                                                    </h5>
                                                </div>
                                            </div>
                                            <div className="p-2 bg-warning-subtle rounded-2">
                                                <i class="ti ti-moneybag"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 5 - Reward */}
                            <div className="col-6 col-lg-4 d-flex align-items-stretch">
                                <div className="card01 w-100 border-0 shadow-sm" style={{ cursor: "pointer" }} onClick={() => goToStatement("Reward")}>
                                    <div className="card-body02 bonus-card p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <p className=" mb-1">Reward</p>
                                                <h5 className="fw-bold mb-0 amount-report">
                                                    ${userData?.Reward?.toLocaleString() || '0.00'}
                                                </h5>
                                            </div>
                                            <div className="p-2 bg-primary-subtle rounded-2">
                                                <i className="ti ti-crown fs-5 text-warning"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 6 - Payoutable */}
                            <div className="col-12 col-lg-4 col-md-12 d-flex align-items-stretch mb-2 mb-lg-0">
                                <div className="card01 w-100 border-0 shadow-sm" style={{ cursor: "pointer" }} >
                                    <div className="card-body02 bonus-card01 p-3">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <p className=" mb-1">Payoutable</p>
                                                <h5 className="fw-bold mb-0 amount-report">
                                                    ${userData?.WorkingWallet?.toLocaleString() || '0.00'}
                                                </h5>
                                            </div>
                                            <div className="p-2 bg-warning-subtle rounded-2">
                                                <i class="ti ti-building-bank"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    {/* Apex mind Token */}
                    <div className="col-lg-4">
                        <div className="row">
                            <div className="col-sm-12 d-flex align-items-stretch">
                                <div className="card w-100">
                                    <div className="card-body02">
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <div className='d-flex'>
                                                <div className="p-2 d-inline-block mb-3">
                                                    <img
                                                        src={apexcoin}
                                                        alt="Apex Coin"
                                                        style={{
                                                            width: "24px",
                                                            height: "24px",
                                                            borderRadius: "50%"
                                                        }}
                                                    />
                                                </div>
                                                <div className='mt-1 ms-1' style={{ fontSize: "18px", fontWeight: '800' }}>APEX</div>
                                            </div>

                                            {/*  Price Change Indicator */}
                                            <div style={{
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: priceChange >= 0 ? '#28a745' : '#dc3545',
                                                background: priceChange >= 0 ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)',
                                                padding: '2px 10px',
                                                borderRadius: '20px',
                                                marginTop: "-20px"
                                            }}>
                                                {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
                                            </div>
                                        </div>

                                        {/*  Live Dynamic Chart - Aage Badhta Hua */}
                                        <div style={{ height: "65px" }}>
                                            <Line
                                                data={{
                                                    labels: labels, //  Dynamic labels (time)
                                                    datasets: [{
                                                        data: chartData,
                                                        borderColor: priceChange >= 0 ? "#28a745" : "#dc3545",
                                                        backgroundColor: priceChange >= 0
                                                            ? "rgba(40,167,69,0.10)"
                                                            : "rgba(220,53,69,0.10)",
                                                        fill: true,
                                                        tension: 0.4,
                                                        borderWidth: 3,
                                                        pointRadius: 2,
                                                        pointHoverRadius: 5,
                                                        pointBackgroundColor: "#ffffff",
                                                        pointBorderColor: priceChange >= 0 ? "#28a745" : "#dc3545",
                                                        pointBorderWidth: 2
                                                    }],
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { display: false },
                                                        tooltip: {
                                                            backgroundColor: "#111827",
                                                            padding: 10,
                                                            displayColors: false,
                                                            cornerRadius: 10,
                                                            callbacks: {
                                                                label: function (context) {
                                                                    return `$${(context.parsed.y / 8).toFixed(2)}`;
                                                                }
                                                            }
                                                        }
                                                    },
                                                    scales: {
                                                        x: {
                                                            display: false,
                                                            grid: { display: false },
                                                            border: { display: false }
                                                        },
                                                        y: {
                                                            display: false,
                                                            grid: { display: false },
                                                            border: { display: false },
                                                            suggestedMin: 0,
                                                            suggestedMax: 45
                                                        }
                                                    },
                                                    animation: {
                                                        duration: 750, //  Smooth animation
                                                        easing: 'easeInOutQuad'
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/*  Live Price Display */}
                                        <div style={{ cursor: "pointer" }} className="mt-2">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <h4 className="fw-semibold d-flex align-content-center amount-report" style={{ marginBottom: '2px' }}>
                                                        ${price.toFixed(2)}
                                                        <i className={`ti ti-arrow-up-right fs-5 ${priceChange >= 0 ? 'text-success' : 'text-danger'}`}></i>
                                                    </h4>
                                                    <div className="mb-0" style={{ fontSize: '13px', color: '#6c757d' }}>Live Token Price</div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
</div>

                    <hr className='mb-2' style={{ backgroundColor: "black", height: "1px" }} />
                    <div className='text-dark'>
                        <h3 className='mb-3'>Apex Minning Program</h3>
                    </div>

                    {/* Team/Business Details Section */}
                    <div className="container-fluid000">
                        <div className="row g-3">

                            {/* Left Side - col-8 */}
                            <div className="col-12 col-lg-8">
                                <div className="row g-2">

                                    {/* Row 1 - 3 Cards */}
                                    <div className="col-12">
                                        <div className="row g-2">

                                            {/* Card 1 - Invest Token */}
                                            <div className="col-6 col-md-4 col-lg-4 d-flex align-items-stretch">
                                                <div
                                                    className="card02 w-100 border-0 shadow-sm h-100"
                                                    style={{
                                                        cursor: "pointer",
                                                        borderRadius: "12px",
                                                        transition: "all 0.3s ease"
                                                    }}

                                                >
                                                    <div className="card-body02 p-3 d-flex flex-column">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div className="flex-grow-1 ">
                                                                <div style={{
                                                                    fontSize: "15px",
                                                                    fontWeight: "600",
                                                                    color: "#6c757d",
                                                                    marginBottom: "2px"
                                                                }}>
                                                                    Invest Amount
                                                                </div>


                                                                <div className='amount-report01'>
                                                                    <Link to="/dashboard/InvestTokenHistory" style={{
                                                                    fontSize: '23px',
                                                                    color: 'green',
                                                                    fontWeight: "600"
                                                                }}>
                                                                        ${userData?.TotalAmountBuyToken || '0'}</Link>
                                                                </div>






                                                                <div className='mt-1'>
                                                                    <p style={{
                                                                        fontSize: "16px",
                                                                        fontWeight: "600",
                                                                        color: "#6c757d",
                                                                        marginBottom: "0"
                                                                    }}>
                                                                        Invest Token
                                                                    </p>
                                                                    <div className='mt-1 amount-report01' style={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "8px",
                                                                        fontSize: '23px',
                                                                        fontWeight: "600"

                                                                    }}>
                                                                        <img
                                                                            src={apexcoin}
                                                                            alt="Apex Coin"
                                                                            style={{
                                                                                width: "24px",
                                                                                height: "24px",
                                                                                borderRadius: "50%"
                                                                            }}
                                                                        />
                                                                        <Link to="/dashboard/InvestTokenHistory" style={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: "8px",
                                                                        fontSize: '23px',
                                                                        fontWeight: "600",
                                                                        color: "green"

                                                                    }}
                                                                        >
                                                                            {userData?.TotalTokenInWallet || '0'}
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-2 bg-primary-subtle rounded-2 ms-2" style={{
                                                                backgroundColor: "rgba(253, 53, 13, 0.1)",
                                                                borderRadius: "8px",
                                                                padding: "8px"
                                                            }}>
                                                                <i className="ti ti-users fs-5 text-primary" style={{ fontSize: "20px", color: "#0d6efd" }}></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card 2 - Overall Token */}
                                            <div className="col-6 col-md-4 col-lg-4 d-flex align-items-stretch">
                                                <div
                                                    className="card02 w-100 border-0 shadow-sm h-100"
                                                    style={{
                                                        cursor: "pointer",
                                                        borderRadius: "12px",
                                                        transition: "all 0.3s ease"
                                                    }}

                                                >
                                                    <div className="card-body02 p-3 d-flex flex-column">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div className="flex-grow-1 p-">

                                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                                                                    <div className=''>
                                                                        <p style={{
                                                                            fontSize: "16x",
                                                                            fontWeight: "600",
                                                                            color: "#6c757d",
                                                                            marginBottom: "0"
                                                                        }}>
                                                                            Earned Token
                                                                        </p>

                                                                        <div className='mt-1 amount-report01' style={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: "8px",
                                                                        }}>
                                                                            <img
                                                                                src={apexcoin}
                                                                                alt="Apex Coin"
                                                                                style={{
                                                                                    width: "24px",
                                                                                    height: "24px",
                                                                                    borderRadius: "50%"
                                                                                }}
                                                                            />
                                                                            <div className='' onClick={() => goToHistory("")}>
                                                                                {userData?.TotalEarnTokenInWallet || '0'}
                                                                            </div>
                                                                        </div></div>
                                                                </div>
                                                                <div className='' style={{
                                                                    fontSize: "16px",
                                                                    fontWeight: "600",
                                                                    color: "#6c757d",
                                                                    marginTop: "10px"

                                                                }}>
                                                                    Current Value
                                                                </div>
                                                                <div className='amount-report01 mt-1'>
                                                                    ${((userData?.TotalEarnTokenInWallet || 0) * price).toFixed(2)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <p style={{
                                                            fontSize: "15px",
                                                            fontWeight: "500",
                                                            color: "#6c757d",
                                                            marginBottom: "0",
                                                            marginTop: "4px"
                                                        }}>
                                                            Live Token Price:
                                                            <span style={{
                                                                color: "green",
                                                                fontWeight: "700",
                                                                marginLeft: "4px",
                                                                fontSize: "15px"
                                                            }}>
                                                                {price.toFixed(2)}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className="p-2 bg-success-subtle rounded-2 ms-2" style={{
                                                        backgroundColor: "rgba(40, 167, 69, 0.1)",
                                                        borderRadius: "8px",
                                                        padding: "8px"
                                                    }}>
                                                        <i className="ti ti-gift fs-5 text-success" style={{ fontSize: "20px", color: "green" }}></i>
                                                    </div>
                                                </div>
                                            </div>



                                            {/* Card 3 - Mining(ROI) */}
                                            <div className="col-12 col-md-4 col-lg-4 d-flex align-items-stretch">
                                                <div
                                                    className="card02 w-100 border-0 shadow-sm h-100"
                                                    style={{
                                                        cursor: "pointer",
                                                        borderRadius: "12px",
                                                        transition: "all 0.3s ease"
                                                    }}

                                                >
                                                    <div className="card-body02 p-3 d-flex flex-column">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div className="flex-grow-1">
                                                                <p style={{
                                                                    fontSize: "16px",
                                                                    fontWeight: "600",
                                                                    color: "#6c757d",
                                                                    marginBottom: "4px"
                                                                }}>
                                                                    Mining (ROI)
                                                                </p>

                                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                                                    <img
                                                                        src={apexcoin}
                                                                        alt="Apex Coin"
                                                                        style={{
                                                                            width: "24px",
                                                                            height: "24px",
                                                                            borderRadius: "50%"
                                                                        }}
                                                                    />

                                                                    <h5 className='amount-report01'>

                                                                        <div className='' onClick={() => goToHistory("Token Stake Bonus")}>
                                                                            {userData?.TokenStakeBonus?.toLocaleString() || '0'}
                                                                        </div>

                                                                    </h5>
                                                                </div>
                                                                <div className='mt-2' style={{
                                                                    fontSize: "16px",
                                                                    fontWeight: "600",
                                                                    color: "#6c757d",
                                                                    marginBottom: "2px"
                                                                }}>

                                                                    Level Income
                                                                </div>
                                                                <h5 className='amount-report01' style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "8px"
                                                                }}>
                                                                    <img
                                                                        src={apexcoin}
                                                                        alt="Apex Coin"
                                                                        style={{
                                                                            width: "24px",
                                                                            height: "24px",
                                                                            borderRadius: "50%"
                                                                        }}
                                                                    />
                                                                    <div className='' onClick={() => goToHistory("Level Income")}>
                                                                        {userData?.LevelIncome
                                                                            ? Number(userData.LevelIncome).toLocaleString(undefined, {
                                                                                minimumFractionDigits: 2,
                                                                                maximumFractionDigits: 2
                                                                            })
                                                                            : '0.00'
                                                                        }
                                                                    </div>
                                                                </h5>


                                                            </div>
                                                            <div className="p-2 bg-info-subtle rounded-2 ms-2" style={{
                                                                backgroundColor: "rgba(23, 162, 184, 0.1)",
                                                                borderRadius: "8px",
                                                                padding: "8px"
                                                            }}>
                                                                <i className="ti ti-building fs-5 text-info" style={{ fontSize: "20px", color: "#17a2b8" }}></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>



                                    {/* Row 2 - 2 Cards  */}
                                    <div className="col-12 mt-2">
                                        <div className="row g-2">

                                            {/* Card 4 - Social Media Bonus */}
                                            <div className="col-12 col-md-6 d-flex align-items-stretch">
                                                <div className="card02 bonus-card w-100 border-0 shadow-sm h-100" style={{ cursor: "pointer" }}>
                                                    <div className="card-body p-3 d-flex flex-column">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">

                                                            <div>
                                                                <div className="" style={{ fontWeight: "600", fontSize: "16px", color: "#6c757d" }}>Social Media Bonus</div>

                                                                <div className='mt-3' style={{ display: "flex", alignItems: "center", gap: "8px", }}>
                                                                    <img
                                                                        src={apexcoin}
                                                                        alt="Apex Coin"
                                                                        style={{
                                                                            width: "24px",
                                                                            height: "24px",
                                                                            borderRadius: "50%"
                                                                        }}
                                                                    />
                                                                    <h5 style={{ fontWeight: "800", fontSize: "23px", color: "green" }}>
                                                                        <div className='' onClick={() => goToHistory("Social Media Bonus")}>
                                                                            {userData?.SocialBonus?.toLocaleString() || '0'}
                                                                        </div>
                                                                    </h5>
                                                                </div>
                                                            </div>

                                                            <div className="p-2 bg-primary-subtle rounded-2 ms-2">
                                                                <i className="ti ti-user fs-5 text-primary"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card 5 - Air drop */}
                                            <div className="col-12 col-md-6 d-flex align-items-stretch">
                                                <div className="card02 bonus-card01 w-100 border-0 shadow-sm h-100" style={{ cursor: "pointer" }} >
                                                    <div className="card-body02 p-3 d-flex flex-column">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div className="flex-grow-1">
                                                                <div style={{ fontWeight: "600", color: "#6c757d", fontSize: "16px" }}>Air Drop</div>
                                                                <div className='mt-3' style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                                                                    <img
                                                                        src={apexcoin}
                                                                        alt="Apex Coin"
                                                                        style={{
                                                                            width: "24px",
                                                                            height: "24px",
                                                                            borderRadius: "50%"
                                                                        }}
                                                                    />
                                                                    <h5 style={{ fontWeight: "800", color: "green" }}>
                                                                        <div className='' onClick={() => goToHistory("Invest Token Bonus")}>
                                                                            {userData?.tokenBonusOnUpgrade?.toLocaleString() || '0'}
                                                                        </div>
                                                                    </h5>
                                                                </div>
                                                            </div>
                                                            <div className="p-2 bg-warning-subtle rounded-2 ms-2">
                                                                <i className="ti ti-crown fs-5 text-warning"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Right Side - Team/Business Details Card (col-4) */}
                            <div className="col-12 col-lg-4 d-flex align-items-stretch">
                                <div className="card02 w-100 border-0 shadow-sm h-100">
                                    <div className="card-body02 p-3">
                                        <h5 className="card-title fw-semibold mb-3">Team/Business Details</h5>

                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="p-2 bg-primary-subtle rounded-2">
                                                    <i className="ti ti-user fs-5 text-primary"></i>
                                                </div>
                                                <h6 className="mb-0 fw-semibold">Total Team</h6>
                                            </div>
                                            <h6 className="mb-0 fw-semibold">{userData?.TeamCount || '0'}</h6>
                                        </div>

                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="p-2" >
                                                    <i className="ti ti-chart-line fs-5" style={{ color: '#1976D2' }}></i>
                                                </div>
                                                <h6 className="mb-0 fw-semibold">Active Team</h6>
                                            </div>
                                            <h6 className="mb-0 fw-semibold">{userData?.ActiveTeam || '0'}</h6>
                                        </div>

                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="p-2">
                                                    <i className="ti ti-arrows-exchange fs-5" style={{ color: '#1976D2' }}></i>
                                                </div>
                                                <h6 className="mb-0 fw-semibold">Inactive Team</h6>
                                            </div>
                                            <h6 className="mb-0 fw-semibold">{userData?.InactiveTeam || '0'}</h6>
                                        </div>

                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="p-2" >
                                                    <i className="ti ti-repeat fs-5" style={{ color: '#1976D2' }}></i>
                                                </div>
                                                <h6 className="mb-0 fw-semibold">Active Direct</h6>
                                            </div>
                                            <h6 className="mb-0 fw-semibold">{userData?.directId || '0'}</h6>
                                        </div>

                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="p-2" >
                                                    <i className="ti ti-calendar-stats fs-5" style={{ color: '#1976D2' }}></i>
                                                </div>
                                                <h6 className="mb-0 fw-semibold">Level Open</h6>
                                            </div>
                                            <h6 className="mb-0 fw-semibold">{userData?.OpenLevel || '0'}</h6>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

              






                <hr className='mb-2 mt-4' style={{ backgroundColor: "black", height: "1px" }} />
                <div className='text-dark'>
                    <h3 className='mb-3'>All Payout</h3>
                </div>

                {/* payout */}
                <div className='row '>
                    {/* PayOut Card */}
                    <div className="col-12 col-lg-4 d-flex align-items-stretch">
                        <div className="card w-100 border-0">
                            <div className="d-flex justify-content-between p-2 mt-2 px-3">
                                <div style={{ fontWeight: "900", fontSize: "20px" }}>Income Payout</div>
                                <div className='mint-box'><GiProfit /></div>
                            </div>
                            <div className="c-box">
                                <div className="payout-input-box p-3">
                                    <input
                                        type="number"
                                        className="custom-pay-form form-control mb-2"
                                        placeholder='Enter Amount'
                                        value={payoutAmount}
                                        onChange={(e) => setPayoutAmount(e.target.value)}
                                        style={{ padding: "10px", fontWeight: "800", color: "green" }}
                                    />
                                    <div className="d-flex align-items-center justify-content-between mt-4">
                                        <Link to="/dashboard/IncomePayOutHistory">
                                            <h5 className='amount-report'>
                                                ${userData?.WorkingWallet?.toLocaleString() || '0.00'}
                                            </h5>
                                            <p className="mb-2" style={{color: '#3c3a3a'}}>
                                                Payout Amount
                                            </p>
                                        </Link>
                                        <button
                                            type="button"
                                            className="custtom-button"
                                            onClick={handlePayoutClick}
                                        >
                                            PayOut
                                        </button>
                                    </div>
                                    <div className='d-flex align-items-center gap-2'>
                                        <span style={{ color: "green", fontWeight: "bold" }}>Note :</span>
                                        <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>Min Withdrawal $10</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Self Trading Payout */}
                    <div className="col-12 col-lg-4 d-flex align-items-stretch">
                        <div className="card w-100 border-0">
                            <div className="d-flex justify-content-between p-2 mt-2 px-3">
                                <div style={{ fontWeight: "900", fontSize: "20px" }}>Self Trading Payout</div>
                                <div className='mint-box'><GiProfit /></div>
                            </div>
                            <div className="c-box">
                                <div className="payout-input-box p-3">
                                    <input
                                        type="number"
                                        className="custom-pay-form form-control mb-2"
                                        placeholder='Enter Amount'
                                        value={selfPayoutAmount}
                                        onChange={(e) => setSelfPayoutAmount(e.target.value)}
                                        style={{ padding: "10px", fontWeight: "800", color: "green" }}
                                    />
                                    <div className="d-flex align-items-center justify-content-between mt-4">
                                        <Link to="/dashboard/SelfPayoutHistory">
                                            <h5 className='amount-report'>
                                                ${Number(userData?.SelfTrade || 0).toFixed(2)}
                                            </h5>
                                            <p className="mb-2" style={{color: '#3c3a3a'}}  >
                                                Payout Amount
                                            </p>
                                        </Link>
                                        <button
                                            type="button"
                                            className="custtom-button"
                                            onClick={handleSelfPayoutButtonClick}  //  Updated
                                        >
                                            PayOut
                                        </button>
                                    </div>
                                    <div className='d-flex align-items-center gap-2'>
                                        <span style={{ color: "green", fontWeight: "bold" }}>Note :</span>
                                        <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>Min Withdrawal $10</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Token Payout */}
                    <div className="col-12 col-lg-4 d-flex align-items-stretch">
                        <div className="card w-100 border-0">
                            <div className="d-flex justify-content-between p-2 mt-2 px-3">
                                <div style={{ fontWeight: "900", fontSize: "20px" }}>Token Payout</div>
                                <div className='mint-box'><GiProfit /></div>
                            </div>
                            <div className="c-box">
                                <div className="payout-input-box p-3">
                                    <input
                                        type="number"
                                        className="custom-pay-form form-control mb-2"
                                        placeholder='Enter Amount'
                                        value={tokenPayoutAmount}
                                        onChange={(e) => setTokenPayoutAmount(e.target.value)}
                                        style={{ padding: "10px", fontWeight: "800", color: "green" }}
                                    />
                                    <div className="d-flex align-items-center justify-content-between mt-4">

                                        <div className='d-flex align-items-center gap-2'>
                                            <img
                                                src={apexcoin}
                                                alt="Apex Coin"
                                                style={{
                                                    width: "24px",
                                                    height: "24px",
                                                    borderRadius: "50%"
                                                }}
                                            />
                                            <h5 className='amount-report mb-0'>
                                                <div className='' style={{ fontWeight: "800" }} onClick={() => goToHistory("Fund Withdrawal")}>
                                                    {userData?.TotalEarnTokenInWallet?.toLocaleString() || '0.00'}
                                                </div>
                                            </h5>
                                        </div>

                                        <button
                                            type="button"
                                            className="custtom-button"
                                            onClick={() => handleTokenPayout()}
                                        >
                                            PayOut
                                        </button>
                                    </div>
                                    <p className="mb-2">
                                        Payout Token
                                    </p>
                                    <div className='d-flex align-items-center gap-2'>
                                        <span style={{ color: "green", fontWeight: "bold" }}>Note :</span>
                                        <p style={{ margin: 0, color: "#666", fontSize: "13px" }}>Min Withdrawal Tokens 10</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ✅ Withdraw Modal - Without Success State */}
                    {showWithdrawModal && (
                        <div className="modal-overlay">
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h4>Income Payout</h4>
                                    <button
                                        className="modal-close"
                                        onClick={() => {
                                            setShowWithdrawModal(false);
                                            setWithdrawAmount('');
                                            setOtp('');
                                            setOtpSent(false);
                                            setOtpVerified(false);
                                            setLoading(false);
                                            setWithdrawLoading(false);
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="modal-body">
                                    {/* Balance Info */}
                                    <div className="balance-info">
                                        <h6>Available balance</h6>
                                        <strong>${displayBalance?.toLocaleString() || '0.00'}</strong>
                                    </div>

                                    <div className='meddle'>
                                        <div className="methods-grid mt-3">
                                            <div className="method-chip active">
                                                <FaCreditCard />
                                                <span>Wallet Address</span>
                                            </div>
                                        </div>

                                        <div className="saved-details-box mt-3">
                                            <div className="details-content">
                                                <div className="detail-row">
                                                    <span className="detail-value" style={{
                                                        wordBreak: 'break-all',
                                                        fontSize: '13px',
                                                        color: '#495057'
                                                    }}>
                                                        {userData.walletid || 'No wallet address found'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amount Input */}
                                        <div className="amount-area mb-3 mt-3">
                                            <div className="amount-label">Enter Amount</div>
                                            <div className="amount-input-wrapper">
                                                <span className="currency-symbol">$</span>
                                                <input
                                                    type="number"
                                                    className="amount-input"
                                                    placeholder="Enter amount"
                                                    value={withdrawAmount}
                                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                                    disabled={withdrawLoading}
                                                />
                                            </div>
                                        </div>

                                        {/* OTP Section */}
                                        <div className="amount-area mb-3 mt-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="amount-input-wrapper w-100">
                                                    <input
                                                        type="number"
                                                        className="amount-input"
                                                        placeholder="Enter OTP"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        disabled={!otpSent}
                                                    />
                                                </div>

                                                {!otpSent ? (
                                                    <button
                                                        className="btn-primary py-2 px-4 text-nowrap"
                                                        onClick={handleSendOTP}
                                                        disabled={loading}
                                                    >
                                                        {loading ? "Sending..." : "Send OTP"}
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-success py-2 px-4 text-nowrap"
                                                        onClick={handleVerifyOTP}
                                                        disabled={loading || otp.length < 6}
                                                    >
                                                        {loading ? "Verifying..." : "Verify OTP"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            className="modal-button mt-3"
                                            onClick={handleWithdraw}
                                            disabled={withdrawLoading || !otpVerified}
                                            style={{
                                                opacity: (withdrawLoading || !otpVerified) ? 0.6 : 1,
                                                cursor: (withdrawLoading || !otpVerified) ? 'not-allowed' : 'pointer',
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: (withdrawLoading || !otpVerified) ? '#6c757d' : '#667eea',
                                                color: 'white',
                                                fontWeight: '600',
                                                fontSize: '15px'
                                            }}
                                        >
                                            {withdrawLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Processing...
                                                </>
                                            ) : !otpVerified ? (
                                                "Withdraw (Verify OTP First)"
                                            ) : (
                                                "Withdraw"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Self Trading Payout Modal */}
                    {showSelfPayoutModal && (
                        <div className="modal-overlay" onClick={() => resetSelfPayoutModal()}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h4>Self Trading Payout</h4>
                                    <button className="modal-close" onClick={resetSelfPayoutModal}>✕</button>
                                </div>

                                <div className="modal-body">
                                    {/* Balance Info */}
                                    <div style={{
                                        background: '#e8f5e9',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontSize: '14px', color: '#2e7d32' }}>Available Balance</span>
                                        <span style={{ fontSize: '18px', fontWeight: '700', color: '#1b5e20' }}>
                                            ${Number(userData?.SelfTrade || 0).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="methods-grid mt-3">
                                        <div className="method-chip active">
                                            <FaCreditCard />
                                            <span>Wallet Address</span>
                                        </div>
                                    </div>

                                    <div className="saved-details-box mt-3">
                                        <div className="details-content">
                                            <div className="detail-row">
                                                <span className="detail-value" style={{
                                                    wordBreak: 'break-all',
                                                    fontSize: '13px',
                                                    color: '#495057'
                                                }}>
                                                    {userData.walletid || 'No wallet address found'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount Input */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                                            Enter Amount
                                        </label>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            background: '#f5f5f5',
                                            borderRadius: '8px',
                                            border: '1px solid #e0e0e0',
                                            overflow: 'hidden'
                                        }}>
                                            <span style={{ padding: '12px 16px', background: '#e0e0e0', fontWeight: '700', color: '#333' }}>$</span>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Enter amount"
                                                value={selfPayoutAmount}
                                                onChange={(e) => setSelfPayoutAmount(e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px 16px',
                                                    border: 'none',
                                                    outline: 'none',
                                                    fontSize: '16px',
                                                    background: 'transparent'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* ✅ OTP Section - REUSED MAIN OTP */}
                                    <div className="amount-area mb-3 mt-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="amount-input-wrapper w-100">
                                                <input
                                                    type="number"
                                                    className="amount-input"
                                                    placeholder="Enter OTP"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    disabled={!otpSent}
                                                />
                                            </div>

                                            {!otpSent ? (
                                                <button
                                                    className="btn-primary py-2 px-4 text-nowrap"
                                                    onClick={handleSendOTP}
                                                    disabled={loading}
                                                >
                                                    {loading ? "Sending..." : "Send OTP"}
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-success py-2 px-4 text-nowrap"
                                                    onClick={handleVerifyOTP}  // ✅ SAME FUNCTION
                                                    disabled={loading || otp.length < 6}
                                                >
                                                    {loading ? "Verifying..." : "Verify OTP"}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Payout Button */}
                                    <button
                                        onClick={handleSelfTradingPayout}
                                        disabled={selfPayoutLoading || !otpVerified}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: (selfPayoutLoading || !otpVerified) ? '#999' : '#667eea',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            cursor: (selfPayoutLoading || !otpVerified) ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease',
                                            opacity: (selfPayoutLoading || !otpVerified) ? 0.7 : 1,
                                        }}
                                    >
                                        {selfPayoutLoading ? (
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                                Processing...
                                            </span>
                                        ) : !otpVerified ? (
                                            "PayOut (Verify OTP First)"
                                        ) : (
                                            "PayOut"
                                        )}
                                    </button>

                                    <div className='mt-3 ms-1'>
                                        <span style={{ fontSize: '12px', color: 'red' }}>
                                            Note: Minimum Withdraw Limit $10
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Token Payout Modal */}
                    {showTokenPayoutModal && (
                        <div className="modal-overlay" onClick={() => setShowTokenPayoutModal(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h4>Token Payout</h4>
                                    <button
                                        className="modal-close"
                                        onClick={() => {
                                            resetWithdrawModal();
                                            setTokenPayoutAmount('');
                                        }}

                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="modal-body">
                                    {/* Balance Info */}
                                    <div style={{
                                        background: '#e8f5e9',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontSize: '14px', color: '#2e7d32' }}>
                                            Available Tokens
                                        </span>
                                        <span style={{
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: '#1b5e20',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <img
                                                src={apexcoin}
                                                alt="Apex Coin"
                                                style={{
                                                    width: "24px",
                                                    height: "24px",
                                                    borderRadius: "50%"
                                                }}
                                            />
                                            {userData?.TotalEarnTokenInWallet?.toLocaleString() || '0.00'}
                                        </span>
                                    </div>

                                    {/* Token Rate Info */}
                                    <div style={{
                                        background: '#e3f2fd',
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontSize: '14px', color: '#0d47a1' }}>
                                            Live Token Price
                                        </span>
                                        <span style={{
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            color: '#0d47a1'
                                        }}>
                                            {price.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="methods-grid mt-3">
                                        <div className="method-chip active">
                                            <FaCreditCard />
                                            <span>Wallet Address</span>
                                        </div>
                                    </div>

                                    <div className="saved-details-box mt-3">
                                        <div className="details-content">
                                            <div className="detail-row">
                                                <span className="detail-value" style={{
                                                    wordBreak: 'break-all',
                                                    fontSize: '13px',
                                                    color: '#495057'
                                                }}>
                                                    {userData?.TokenAddress || 'No wallet address found'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount Input */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#333',
                                            marginBottom: '8px'
                                        }}>
                                            Enter Token Amount
                                        </label>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            background: '#f5f5f5',
                                            borderRadius: '8px',
                                            border: '1px solid #e0e0e0',
                                            overflow: 'hidden'
                                        }}>
                                            <span style={{
                                                padding: '12px 16px',
                                                background: '#e0e0e0',
                                                fontWeight: '700',
                                                color: '#333'
                                            }}>
                                                <img
                                                    src={apexcoin}
                                                    alt="Apex Coin"
                                                    style={{
                                                        width: "20px",
                                                        height: "20px",
                                                        borderRadius: "50%"
                                                    }}
                                                />
                                            </span>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Enter token amount"
                                                value={tokenPayoutAmount}
                                                onChange={(e) => setTokenPayoutAmount(e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px 16px',
                                                    border: 'none',
                                                    outline: 'none',
                                                    fontSize: '16px',
                                                    background: 'transparent'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="amount-area mb-3 mt-3">
                                        <div className="d-flex align-items-center gap-3">

                                            <div className="amount-input-wrapper w-100">
                                                <input
                                                    type="number"
                                                    className="amount-input"
                                                    placeholder="Enter OTP"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    disabled={!otpSent}
                                                />
                                            </div>

                                            {!otpSent ? (
                                                <button
                                                    className=" btn-primary py-2 px-4 text-nowrap"
                                                    onClick={handleSendOTP}
                                                    disabled={loading}
                                                >
                                                    {loading ? "Sending..." : "Send OTP"}
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-success py-2 px-4 text-nowrap"
                                                    onClick={handleVerifyOTP}
                                                    disabled={loading || otp.length < 6}
                                                >
                                                    {loading ? "Verifying..." : "Verify OTP"}
                                                </button>
                                            )}

                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        marginTop: '10px'
                                    }}>
                                        {/* Token Payout Modal - Submit Button */}
                                        <button
                                            onClick={handleTokenPayoutSubmit}  //  New function
                                            disabled={tokenPayoutLoading || !otpVerified}
                                            style={{
                                                flex: 2,
                                                padding: '12px',
                                                background: (tokenPayoutLoading || !otpVerified)
                                                    ? '#999'
                                                    : '#667eea',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                cursor: (tokenPayoutLoading || !otpVerified) ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.3s ease',
                                                opacity: (tokenPayoutLoading || !otpVerified) ? 0.7 : 1,
                                            }}
                                        >
                                            {tokenPayoutLoading ? (
                                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                                    Processing...
                                                </span>
                                            ) : !otpVerified ? (
                                                "Payout Tokens (Verify OTP First)"
                                            ) : (
                                                "Payout Tokens"
                                            )}
                                        </button>
                                    </div>

                                    {/* Note */}
                                    <div className='mt-3 ms-1'>
                                        <span style={{
                                            fontSize: '12px',
                                            color: 'red',
                                        }}>
                                            Note: Minimum Withdraw Limit 10 Tokens
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>

    );
};

export default Dashboard;