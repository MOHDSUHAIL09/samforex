import { useState, useCallback } from 'react';
import Sidebar from '../Componenets/dashboard/Sidebar';
import Header from '../Componenets/dashboard/Header';
import Dashboard from '../Pages/dashboard/Dashboard';
import { Routes, Route, useLocation } from 'react-router-dom';
import UserProfile from '../Pages/dashboard/Profile/UserProfile';
import Console from '../Pages/dashboard/Consolepage/Console';
import Changepassword from '../Pages/dashboard/Profile/Changepassword';
import Support from '../Pages/dashboard/Profile/Support';
import Treeview from '../Pages/dashboard/Treeview';
import DownlineTeam from '../Pages/dashboard/DownlineTeam';
import DepositHistory from '../Pages/dashboard/DepositHistory';
import InvestmentHistory from '../Pages/dashboard/InvestmentHistory';
import Fundtransfer from '../Pages/dashboard/Fundtransfer';
import InvestFund from '../Pages/dashboard/InvestFund/InvestFund';
import SocalMediaTask from '../Pages/dashboard/SocalMediaTask/SocalMediaTask';
import SocalMediaTaskHistory from '../Pages/dashboard/SocalMediaTask/SocalMediaTaskHistory';
// import IncomePayOutHistory from '../Pages/dashboard/IncomePayOutHistory';
import FundtransferHistory from '../Pages/dashboard/FundtransferHistory';
import IncomeReport from '../Pages/dashboard/IncomeReport';
import BotTreading from '../Pages/dashboard/BotTreading';
import DepositFund from '../Pages/dashboard/DepositFund';
import InvestToken from '../Pages/dashboard/Investtoken/InvestToken';
import InvestTokenHistory from '../Pages/dashboard/Investtoken/InvestTokenHistory';
import BotTradingHistory from '../Pages/dashboard/BotTradingHistory';
import TokenMiningIncomeHistory from '../Pages/dashboard/TokenMiningIncomeHistory';
import SelfPayoutHistory from '../Pages/dashboard/SelfPayoutHistory';
import DashboardSkeleton from '../Componenets/SkeletonLoader/DashboardSkeleton';
import { useUser } from '../context/UserContext';
import SelfTradingHistory from '../Pages/dashboard/SelfTradingHistory';
import IncomePayOutHistory from '../Pages/dashboard/IncomePayOutHistory'
import '../assets/Main.css'
import Reward from '../Pages/dashboard/Reward';
import FundDepositStatus from '../Pages/dashboard/FundDepositStatus';

function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { userData, loading } = useUser();

  const toggleSidebar = useCallback(() => {
    if (window.innerWidth <= 992) {
      setMobileSidebarOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []); 

  const location = useLocation();

  const noSidebarPages = ['/dashboard/console', '/dashboard/tree-view'];
  const hideSidebarAndHeader = noSidebarPages.includes(location.pathname);

  // ✅ Dashboard page check
  const isDashboardPage = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  // ✅ SIRF DASHBOARD PAGE PE SKELETON DIKHEGA
  if (isDashboardPage && (loading || !userData)) {
    return <DashboardSkeleton />;
  }

  // ✅ Agar dashboard page nahi hai aur userData nahi hai toh loading show karo
    // if (!userData && !isDashboardPage) {
    //   return <div className="loading-screen">Loading...</div>;
    // }

  return (
    <div className={`app-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {!hideSidebarAndHeader && (
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          mobileSidebarOpen={mobileSidebarOpen}
          closeMobileSidebar={closeMobileSidebar}
        />
      )}
      <div className={`main-wrapper ${hideSidebarAndHeader ? 'full-screen-mode' : ''}`}>
        {!hideSidebarAndHeader && <Header toggleSidebar={toggleSidebar} />}
        <div className={`main-content ${hideSidebarAndHeader ? 'full-screen-content' : ''}`}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="console" element={<Console />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="changepassword" element={<Changepassword />} />
            <Route path="support" element={<Support />} />
            <Route path="BotTreading" element={<BotTreading />} />
            <Route path="SocalMediaTask" element={<SocalMediaTask />} />
            <Route path="SocalMediaTaskHistory" element={<SocalMediaTaskHistory />} />
            <Route path="InvestFund" element={<InvestFund />} />
            <Route path="DepositFund" element={<DepositFund />} />
            <Route path="IncomePayOutHistory" element={<IncomePayOutHistory/>} />
            <Route path="Fundtransfer" element={<Fundtransfer />} />
            <Route path="FundtransferHistory" element={<FundtransferHistory />} />
            <Route path="DashboardLayout" element={<DashboardLayout />} />
            <Route path="IncomeReport" element={<IncomeReport />} />
            <Route path="SelfPayoutHistory" element={<SelfPayoutHistory />} />
            <Route path="InvestmentHistory" element={<InvestmentHistory />} />
            <Route path="DepositHistory" element={<DepositHistory />} />
            <Route path="downline-team" element={<DownlineTeam />} />
            <Route path="tree-view" element={<Treeview />} />
            <Route path="InvestToken" element={<InvestToken />} />
            <Route path="InvestTokenHistory" element={<InvestTokenHistory />} />
            <Route path="BotTradingHistory" element={<BotTradingHistory />} />
            {/* <Route path="TokenMiningHistory" element={<TokenMiningHistory />} /> */}
            <Route path="TokenMiningIncomeHistory" element={<TokenMiningIncomeHistory />} />
            <Route path="SelfTradingHistory" element={<SelfTradingHistory/>} />
            <Route path="Reward" element={<Reward/>} />
            <Route path="FundDepositStatus" element={<FundDepositStatus/>} />
          </Routes>
        </div>
      </div>
      {mobileSidebarOpen && <div className="sidebar-overlay" onClick={closeMobileSidebar}></div>}
    </div>
  );
}

export default DashboardLayout;