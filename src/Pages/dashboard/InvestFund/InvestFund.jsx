import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Wallet, History, ShieldCheck,ArrowRight, Zap, Headphones, BarChart3 } from 'lucide-react';
import apiClient from '../../../api/apiClient';
import { useUser } from '../../../context/UserContext';
import Toast from '../../../Componenets/ui/Toast';
import './Invest.css';

const InvestFund = () => {
  const { fetchData, userData } = useUser();
  const [bot1Amount, setBot1Amount] = useState('');
  const [bot2Amount, setBot2Amount] = useState('');
  const [loadingBot1, setLoadingBot1] = useState(false);
  const [loadingBot2, setLoadingBot2] = useState(false);

  const regno = sessionStorage.getItem("Regno");

  const investInBot = async (botId, amount) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    if (botId === 1 && (parseFloat(amount) < 100 || parseFloat(amount) > 999)) {
      toast.error('Bot 1: Amount must be between $100 and $999.'); return;
    }
    if (botId === 2 && (parseFloat(amount) < 1000 || parseFloat(amount) > 5000)) {
      toast.error('Bot 2: Amount must be between $1000 and $5000.'); return;
    }

    botId === 1 ? setLoadingBot1(true) : setLoadingBot2(true);
    try {
      const response = await apiClient.post('/Dashboard/Investment', {
        regno: regno,
        rkprice: parseFloat(amount),
        uRegno: 0,
      });
      if (response.data.result === 'true') {
        toast.success(response.data.message);
        await fetchData();
        botId === 1 ? setBot1Amount('') : setBot2Amount('');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Something went wrong!');
    } finally {
      setLoadingBot1(false); setLoadingBot2(false);
    }
  };

  return (
    <div className="invest-container">
      <Toast />
      
      {/* Top Navigation Bar - Fully Responsive */}
      <div className="invest-header">
        <div className="header-left">
          <div className="logo-box">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" 
              alt="bot" 
            />
          </div>
          <div className="title-box">
            <h1>Invest <span>Bot</span></h1>
            <p>Smart bots. Better returns.</p>
          </div>
        </div>
        <div className="header-right">
          <div className="btn-primary gap-1" >
            <Wallet size={20} className="wallet-icon me-1" style={{color: "#fff"}}/>
            <div className="deposit-info">
              <span className="value">${userData?.Depositfund?.toLocaleString() || 0}</span>
            </div>
          </div>

          <Link to="/dashboard/InvestmentHistory" className=" btn-primary gap-1">
            <History size={18} />
            <span>History</span>
          </Link>
        </div>
      </div>


      <div className="bot-grid">
        {/* Bot 1 - Purple Theme */}
        <div className="bot-card purple-theme">
          <div className="card-header">          
            <div className="bot-details">    
              <h3>BOT 1 </h3>   
            </div>
            <div className="top-shield"><ShieldCheck size={18} /></div>
          </div>

          <div className="card-middle">
            <div className="bot-visual">
               <div className="bot-glow"></div>
               <img src="https://i.pinimg.com/1200x/18/39/fe/1839fe826cbbda43160f5aa76031d9a3.jpg" alt="bot1" />
            </div>
            <div className="profit-box">
              <p className="profit-label">Expected Weekly Profit</p>
              <h2 className="profit-value">UPTO <span>2.5%</span></h2>
              <div className="info-row01 mt-2">
                <p style={{maxWidth: "300px"}}> <span style={{color: "green"}}>Note: </span>A member will get upto 2.5% profit on equity deposit weekly.</p>
              </div>
              <div className="info-row01 mt-2">
                <p><span style={{color: 'green'}}>Limit:</span> Min deposit <span>$100</span> | Max <span>$999</span></p>
              </div>
            </div>
          </div>

          <div className="form-group03">
            <label className="form-label mb-1">AMOUNT *</label>
            <div className="amount-input-wrapper mb-3">
              <span className="currency-sign">$</span>
              <input 
                className='amount-input-field' 
                type="number" 
                placeholder="Enter Amount" 
                value={bot1Amount} 
                onChange={(e) => setBot1Amount(e.target.value)} 
              />
            </div>
            <button 
              className="invest-now-btn" 
              onClick={() => investInBot(1, bot1Amount)} 
              disabled={loadingBot1}
            >
              <div className="btn-dots"><span></span><span></span><span></span></div>
              {loadingBot1 ? "PROCESSING..." : "INVEST NOW"}
              <div className="arrow-circle"><ArrowRight size={16} /></div>
            </button>
          </div>
        </div>

        {/* Bot 2 - Blue Theme */}
        <div className="bot-card blue-theme">
          <div className="card-header">
            {/* <div className="bot-num">02</div> */}
            <div className="bot-details">
              <h3>BOT 2</h3>
            </div>
            <div className="top-shield"><ShieldCheck size={18} /></div>
          </div>

          <div className="card-middle">
            <div className="bot-visual">
               <div className="bot-glow"></div>
               <img src="https://i.pinimg.com/736x/2f/a9/af/2fa9afe7803e88bf73727ba5d83d25a9.jpg" alt="bot2" />
            </div>
            <div className="profit-box">
              <p className="profit-label">Expected Weekly Profit</p>
              <h2 className="profit-value">UPTO <span>3%</span></h2>
              <div className="info-row01 mt-2">
                <p style={{maxWidth: "300px"}}><span style={{color: "green"}}>Note:</span> A member will get upto 3% profit on equity deposit weekly.</p>
              </div>
              <div className="info-row01 mt-2">
                <p><span style={{color: "green"}}>Limit:</span> Min deposit <span>$1000</span> | Max <span>$5000</span></p>
              </div>
            </div>
          </div>

          <div className="form-group03">
            <label className="form-label mb-1">AMOUNT *</label>
            <div className="amount-input-wrapper mb-3">
              <span className="currency-sign">$</span>
              <input 
                className='amount-input-field' 
                type="number" 
                placeholder="Enter Amount" 
                value={bot2Amount} 
                onChange={(e) => setBot2Amount(e.target.value)} 
              />
            </div>
            <button 
              className="invest-now-btn" 
              onClick={() => investInBot(2, bot2Amount)} 
              disabled={loadingBot2}
            >
              <div className="btn-dots"><span></span><span></span><span></span></div>
              {loadingBot2 ? "PROCESSING..." : "INVEST NOW"}
              <div className="arrow-circle"><ArrowRight size={16} /></div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Features Bar */}
      <div className="features-row">
        <div className="f-item">
          <div className="f-icon purple"><ShieldCheck /></div>
          <div className="f-text"><h3>Secure & Safe</h3><p>Your investments are protected</p></div>
        </div>
        <div className="f-item">
          <div className="f-icon purple"><BarChart3 /></div>
          <div className="f-text"><h3>Weekly Profit</h3><p>Earn profit every week</p></div>
        </div>
        <div className="f-item">
          <div className="f-icon blue"><Zap /></div>
          <div className="f-text"><h3>Instant Start</h3><p>Get started in few clicks</p></div>
        </div>
        <div className="f-item">
          <div className="f-icon green"><Headphones /></div>
          <div className="f-text"><h3>24/7 Support</h3><p>We are here for you</p></div>
        </div>
      </div>
    </div>
  );
};

export default InvestFund;