import { useState, useEffect, useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '../../api/apiClient';
import { useUser } from '../../context/UserContext';
import { Link } from 'react-router-dom';

const BotTrading = () => {
    // -------------------- STATE ENGINE --------------------
    const [botStatus, setBotStatus] = useState({ isRunning: false, progress: 0 });

    const getRandomCurrencyInit = () => {
        const currencies = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'];
        return currencies[Math.floor(Math.random() * currencies.length)];
    };
    const [selectedCurrency, setSelectedCurrency] = useState(getRandomCurrencyInit());
    const [isRoundActive, setIsRoundActive] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(24);
    const { userData } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(" ");
    const [apiBotStatus, setApiBotStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const regno = sessionStorage.getItem('Regno');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const { refreshData } = useUser();

    // -------------------- CHART STATE --------------------
    const [chartData, setChartData] = useState([]);
    const [lastPrice, setLastPrice] = useState(null);
    const [roundStartIndex, setRoundStartIndex] = useState(null);
    const [roundStartPrice, setRoundStartPrice] = useState(null);

    // ── 🔴 CURRENCY CONFIG ──
    const getCryptoConfig = (symbol) => {
        const configs = {
            'BTC': { symbol: 'BTC', binanceSymbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
            'ETH': { symbol: 'ETH', binanceSymbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
            'BNB': { symbol: 'BNB', binanceSymbol: 'BNBUSDT', name: 'Binance Coin', icon: '🔶' },
            'SOL': { symbol: 'SOL', binanceSymbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
            'XRP': { symbol: 'XRP', binanceSymbol: 'XRPUSDT', name: 'Ripple', icon: '✕' }
        };
        return configs[symbol] || configs['BTC'];
    };

    const currentConfig = getCryptoConfig(selectedCurrency);

    // ── 🔴 TRADINGVIEW CHART LOADER ──
    useEffect(() => {
        const container = document.getElementById('tradingview_chart');
        if (container) container.innerHTML = '';

        if (!document.getElementById('tv-script')) {
            const script = document.createElement('script');
            script.id = 'tv-script';
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.onload = () => initTradingView();
            document.head.appendChild(script);
        } else {
            initTradingView();
        }

        function initTradingView() {
            if (window.TradingView) {
                new window.TradingView.widget({
                    "width": "100%",
                    "height": 500,
                    "symbol": `BINANCE:${selectedCurrency}USDT`,
                    "interval": "1",
                    "timezone": "Asia/Kolkata",
                    "theme": "dark",
                    "style": "1",
                    "locale": "in",
                    "toolbar_bg": "#131722",
                    "enable_publishing": false,
                    "allow_symbol_change": false,
                    "container_id": "tradingview_chart",
                    "hide_side_toolbar": true,
                    "hide_top_toolbar": true,
                    "hide_volume": true,
                    "save_image": false,
                    "studies": [],
                    "overrides": {
                        "mainSeriesProperties.candleStyle.upColor": "#26a69a",
                        "mainSeriesProperties.candleStyle.downColor": "#ef5350",
                        "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
                        "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350"
                    }
                });

                setTimeout(() => {
                    fetchLatestPrice();
                }, 2000);
            }
        }

        return () => {
            const container = document.getElementById('tradingview_chart');
            if (container) container.innerHTML = '';
        };
    }, [selectedCurrency]);

    // ── 🔴 FETCH LATEST PRICE ──
    const fetchLatestPrice = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(
                `https://api.binance.com/api/v3/ticker/price?symbol=${currentConfig.binanceSymbol}`,
                { signal: controller.signal }
            );

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                const price = parseFloat(data.price);
                setLastPrice(price);
                setChartData(prev => {
                    const newData = [...prev, price];
                    if (newData.length > 100) return newData.slice(-90);
                    return newData;
                });
                return price;
            } else {
                console.warn('Binance API returned:', response.status);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('⏱️ Price fetch timeout');
            } else {
                console.error('Price fetch error:', error);
            }
        }
        return null;
    };

    // ── 🔴 PERIODIC PRICE UPDATE ──
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLatestPrice();
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedCurrency]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Countdown Timer logic
    useEffect(() => {
        if (!userData?.status) return;
        const targetTime = new Date(userData.status.replace(" ", "T") + "+04:00").getTime();
        const timer = setInterval(() => {
            const diff = targetTime - Date.now();
            if (diff <= 0) {
                setCountdown("00H : 00M : 00S");
                clearInterval(timer);
                return;
            }
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setCountdown(`${String(hours).padStart(2, "0")}H : ${String(minutes).padStart(2, "0")}M : ${String(seconds).padStart(2, "0")}S`);
        }, 1000);
        return () => clearInterval(timer);
    }, [userData?.status]);

    // Fetch Bot Status
    const fetchBotStatus = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/Trading/BotStatus?regno=${regno}`);
            if (response.data?.result === "true") {
                const status = response.data?.response?.status;
                setApiBotStatus(status);
                setBotStatus(prev => ({ ...prev, isRunning: status === 2 }));
            } else {
                setApiBotStatus(1);
            }
        } catch (error) {
            setApiBotStatus(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBotStatus(); }, []);

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
        setShowDropdown(false);
        toast.info(` ${slot} Hours selected!`);
    };

    // ── 🔴 FRESH PRICE FETCH (NO FALLBACK) ──
    const fetchFreshPrice = async (binanceSymbol) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        try {
            const response = await fetch(
                `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`,
                { signal: controller.signal }
            );
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`Binance ${response.status}`);
            const data = await response.json();
            const price = parseFloat(data.price);
            if (!price || isNaN(price) || price <= 0) throw new Error("Invalid price");
            return price;
        } catch (err) {
            clearTimeout(timeoutId);
            console.error("❌ Fresh price fetch failed:", err);
            return null;
        }
    };

    const handleStartBot = async () => {
        if (apiBotStatus === 0 || botStatus.isRunning) {
            toast.warning(' Bot is already running!');
            return;
        }
        if (!selectedSlot) {
            toast.warning(' Please select a slot first!');
            return;
        }

        const finalCurrency = selectedCurrency;
        const config = getCryptoConfig(finalCurrency);
        const betAmount = parseFloat(userData?.Invest) || 100;

        setIsSubmitting(true);

        // ── 🔴 FRESH PRICE FROM BINANCE (NO STALE lastPrice FALLBACK) ──
        const livePrice = await fetchFreshPrice(config.binanceSymbol);

        if (livePrice === null) {
            toast.error(" Live price fetch nahi ho paya. Internet check karo aur dobara try karo.");
            setIsSubmitting(false);
            return;
        }

        console.log(`💰 Live ${finalCurrency} price:`, livePrice);

        const payload = {
            regno: parseInt(regno),
            betAmount: betAmount,
            currency: finalCurrency.toLowerCase(),
            currencyRate: livePrice,   // 🔴 EXACT live price — koi toFixed nahi
            slot: selectedSlot
        };

        console.log("📤 Payload:", payload);

        try {
            const response = await apiClient.post('/Trading/BotTrading', payload);

            if (response.data?.result === "true") {
                toast.success(`Bot started for ${selectedSlot} hrs with ${finalCurrency} @ $${livePrice}`);
                await refreshData();
                setBotStatus({ isRunning: true, progress: 0 });
                setApiBotStatus(0);
                setIsRoundActive(true);

                if (chartData.length > 0) {
                    const lastIndex = chartData.length - 1;
                    setRoundStartIndex(lastIndex);
                    setRoundStartPrice(chartData[lastIndex]);
                }

                fetchBotStatus();
            } else {
                toast.error(response.data?.message || "Bot start failed");
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="row">
            <div className="col-12">
                <div className="">
                    <div className="card-body p-0">
                        <div
                            id="tradingview_chart"
                            style={{
                                width: "100%",
                                height: "500px",
                                background: "#131722"
                            }}
                        ></div>

                        <div className="col-12">
                            <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
                                <div className="card-body" style={{
                                    background: 'linear-gradient(145deg, #f8fafc, #e2e8f0)',
                                    borderRadius: '16px'
                                }}>
                                    <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                                        <div style={{ flexShrink: 0 }}>
                                            <h4 className="mb-0">Total Balance</h4>
                                            <Link to="/dashboard/BotTradingHistory">
                                                <h3 className="mb-0 fw-bold" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.75rem)', color: "green" }}>
                                                    ${userData?.Invest || "0.00"}
                                                </h3>
                                            </Link>
                                        </div>

                                        {!loading && (
                                            <div style={{ flexShrink: 0 }}>
                                                {apiBotStatus === 0 ? (
                                                    <button
                                                        className="btn px-4 py-2 border-0"
                                                        style={{
                                                            backgroundColor: 'green',
                                                            color: '#ffffff',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            cursor: 'not-allowed',
                                                            minWidth: '130px',
                                                            boxShadow: '0 4px 15px rgba(54, 160, 18, 0.3)',
                                                            opacity: 0.8,
                                                            borderRadius: '10px'
                                                        }}
                                                        disabled
                                                    >
                                                        <div>Expire Time</div>
                                                        <small style={{ fontSize: '10px', opacity: 0.8 }}>{countdown}</small>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn px-4 py-2 border-0"
                                                        style={{
                                                            backgroundColor: isSubmitting ? '#94a3b8' : '#344bdf',
                                                            color: '#ffffff',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                                            minWidth: '130px',
                                                            boxShadow: isSubmitting ? 'none' : '0 4px 15px rgb(28, 48, 135)',
                                                            borderRadius: '10px'
                                                        }}
                                                        onClick={handleStartBot}
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? "Starting..." : " Start Bot"}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                            <select
                                                className="form-select text-uppercase fw-bold"
                                                value={selectedCurrency}
                                                onChange={(e) => setSelectedCurrency(e.target.value)}
                                                style={{
                                                    width: '110px',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    fontSize: '13px',
                                                    padding: '5px 8px',
                                                    backgroundColor: '#ffffff',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="BTC">₿ BTC</option>
                                                <option value="ETH">Ξ ETH</option>
                                                <option value="BNB">🔶 BNB</option>
                                                <option value="SOL">◎ SOL</option>
                                                <option value="XRP">✕ XRP</option>
                                            </select>

                                            <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
                                                <button
                                                    onClick={() => setShowDropdown(!showDropdown)}
                                                    style={{
                                                        padding: '5px 12px',
                                                        borderRadius: '10px',
                                                        border: '2px solid #e2e8f0',
                                                        background: '#ffffff',
                                                        color: '#475569',
                                                        fontWeight: '600',
                                                        fontSize: '13px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                >
                                                    <span>{selectedSlot ? `${selectedSlot} Hrs` : 'Slot'}</span>
                                                    <FaChevronDown size={10} style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
                                                </button>

                                                {showDropdown && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '110%',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        background: '#ffffff',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                                        border: '1px solid #e2e8f0',
                                                        padding: '6px',
                                                        minWidth: '90px',
                                                        zIndex: 1000
                                                    }}>
                                                        {[24].map((slot) => (
                                                            <button
                                                                key={slot}
                                                                onClick={() => handleSlotSelect(slot)}
                                                                style={{
                                                                    display: 'block',
                                                                    width: '100%',
                                                                    padding: '6px 12px',
                                                                    border: 'none',
                                                                    background: selectedSlot === slot ? '#10b981' : 'transparent',
                                                                    color: selectedSlot === slot ? '#ffffff' : '#475569',
                                                                    borderRadius: '6px',
                                                                    fontWeight: '600',
                                                                    fontSize: '13px',
                                                                    cursor: 'pointer',
                                                                    textAlign: 'center'
                                                                }}
                                                            >
                                                                {slot} Hrs
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BotTrading;