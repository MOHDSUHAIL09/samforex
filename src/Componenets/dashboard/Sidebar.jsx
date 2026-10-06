import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaExternalLinkAlt } from "react-icons/fa";
import {
  IconHome,
  IconDeviceImacDollar,
  IconReplaceUser,
  IconHistory,
  IconUsersGroup,
  IconBinaryTree2,
  IconPower,
  IconAward
} from '@tabler/icons-react';
import { RiRobot2Line } from "react-icons/ri";
import { RiHandCoinFill } from "react-icons/ri";
import { FaWallet } from "react-icons/fa";
import { useUser } from '../../context/UserContext';
import dashboardlogo from '../../assets/images/logo/dashboardlogo.png'
import smalldashboardlogo from '../../assets/images/logo/dashboardlogo.png'

const Sidebar = ({ sidebarCollapsed, mobileSidebarOpen, closeMobileSidebar }) => {
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, logoutUser } = useUser();
  
  const toggleMenu = (menu) => {
    if (!sidebarCollapsed || window.innerWidth <= 992) {
      setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    }
  };

  useEffect(() => {
    if (sidebarCollapsed && window.innerWidth > 992) {
      setOpenMenus({});
    }
  }, [sidebarCollapsed]);

  const handleLinkClick = () => {
    if (window.innerWidth <= 992 && closeMobileSidebar) {
      closeMobileSidebar();
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  // ✅ SIRF YAHI CHANGE KIYA HAI - Exact match
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Sidebar Menu Items
  const menuItems = [
    { path: '/dashboard', icon: <IconHome stroke={2} />, label: 'Home' },
    { path: '/dashboard/DepositFund', icon: <FaWallet stroke={2} />, label: 'Deposit Fund' },
    { path: '/dashboard/DepositHistory', icon: <IconHistory stroke={2} />, label: 'Deposit History' },
    { path: '/dashboard/InvestFund', icon: <IconDeviceImacDollar stroke={2} />, label: 'Invest' },
    { path: '/dashboard/InvestmentHistory', icon: <IconHistory stroke={2} />, label: 'Investment History' },
    { path: '/dashboard/BotTreading', icon: <RiRobot2Line style={{ fontSize: "23px" }} />, label: 'Bot Status' },
    { path: '/dashboard/BotTradingHistory', icon: <IconHistory stroke={2} />, label: 'Bot Status History' },
    { path: '/dashboard/InvestToken', icon: <RiHandCoinFill stroke={2} />, label: 'Token Mining' },
    { path: '/dashboard/InvestTokenHistory', icon: <IconHistory stroke={2} />, label: 'Token Mining History' },
    { path: '/dashboard/TokenMiningIncomeHistory', icon: <IconHistory stroke={2} />, label: 'Token Mining Income' },
    { path: '/dashboard/Fundtransfer', icon: <IconReplaceUser stroke={2} />, label: 'Fund Transfer' },
    { path: '/dashboard/IncomePayOutHistory', icon: <IconHistory stroke={2} />, label: 'Income Payout History' },
    { path: '/dashboard/SelfPayoutHistory', icon: <IconHistory stroke={2} />, label: 'Self Payout History' },
    { path: '/dashboard/SelfTradingHistory', icon: <IconHistory stroke={2} />, label: 'Self Trading History' },
    { path: '/dashboard/IncomeReport', icon: <IconHistory stroke={2} />, label: 'Income History' },
    { path: '/dashboard/Reward', icon: <IconAward stroke={2} />, label: 'Reward' },
    { path: '/dashboard/SocalMediaTask', icon: <FaExternalLinkAlt />, label: 'Social Media Task' },
    { path: '/dashboard/downline-team', icon: <IconUsersGroup stroke={2} />, label: 'Downline Team' },
    { path: '/dashboard/tree-view', icon: <IconBinaryTree2 stroke={2} />, label: 'Tree View' },
  ];

  // Check if sidebar is collapsed (desktop) or mobile
  const isCollapsed = sidebarCollapsed && window.innerWidth > 992;

  return (
    <aside className={`left-sidebar with-vertical ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
      <div>
        {/* Brand Logo - Big Logo when expanded, Small Logo when collapsed */}
        <div className="brand-logo d-flex align-items-center justify-content-between">
          <Link to="/" className="text-nowrap logo-img" onClick={handleLinkClick}>
            {!isCollapsed ? (
              <img
                src={dashboardlogo}
                alt="Logo-Dark"
                className="dark-logo"
                style={{ width: "180px", transition: 'all 0.3s ease' }}
              />
            ) : (
              <img
                src={smalldashboardlogo}
                alt="Logo-Dark"
                className="dark-logo"
                style={{ 
                  width: "40px", 
                  height: "40px",
                  transition: 'all 0.3s ease',
                  borderRadius: '8px'
                }}
              />
            )}
          </Link>

          <button
            className="mobile-close-btn d-lg-none"
            onClick={closeMobileSidebar}
          >
            <i className="ti ti-x"></i>
          </button>
        </div>

        <nav className="sidebar-nav scroll-sidebar" data-simplebar>
          <ul id="sidebarnav">
            {/* Main Menu Items */}
            {menuItems.map((item, index) => (
              <li className="sidebar-item" key={index}>
                <Link
                  className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                  to={item.path}
                  onClick={handleLinkClick}
                >
                  <span>{item.icon}</span>
                  {(!sidebarCollapsed || window.innerWidth <= 992) && (
                    <span className="hide-menu">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}

            {/* Fixed Profile Section */}
            <div className={`fixed-profile ${(!sidebarCollapsed || window.innerWidth <= 992) ? '' : 'collapsed-profile'}`}>
              <div className="hstack gap-3">
                <Link to="/dashboard/profile">
                  <div className="john-img">
                    <img
                      src='https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/profile/user-1.jpg'
                      className="rounded-circle"
                      width="45px"
                      height="45px"
                      alt="profile"
                    />
                  </div>
                </Link>
                {(!sidebarCollapsed || window.innerWidth <= 992) && (
                  <>
                    <div className="john-title">
                      <h6 className="mb-0 text-dark amount-report" style={{ fontWeight: '600' }}>
                        {userData?.fname}
                      </h6>
                      <span style={{ fontSize: "13px", color: '#94a3b8' }}>
                        {userData?.loginid || 'Guest'}
                      </span>
                    </div>
                    <div
                      className="border-0 bg-transparent text-primary ms-auto"
                      onClick={handleLogout}
                      style={{ 
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#fee2e2';
                        e.target.style.color = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#5D87FF';
                      }}
                    >
                      <IconPower stroke={2} size={20} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </ul>
        </nav>
      </div>

      {/* Sidebar Styles */}
      <style>{`
        .left-sidebar .sidebar-link.active {
          background: linear-gradient(135deg, #5D87FF15, #696cff15) !important;
          color: #5D87FF !important;  
        }

        .left-sidebar .sidebar-link.active span {
          color: #5D87FF !important;
        }

        .left-sidebar .sidebar-link:hover {
          background: #f1f5f9 !important;
          color: #1e293b !important;
        }

        .left-sidebar .sidebar-item {
          margin: 2px 0;
        }

        .left-sidebar .sidebar-link {
          padding: 10px 20px;
          border-radius: 8px;
          margin: 0 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #64748b;
          font-weight: 500;
          font-size: 14px;
        }

        .left-sidebar .sidebar-link span:first-child {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          font-size: 18px;
        }

        .left-sidebar .hide-menu {
          font-size: 14px;
          font-weight: 500;
        }

        .fixed-profile {
          padding: 16px 20px;
          margin-top: 12px;
          border-top: 1px solid #f1f5f9;
        }

        .fixed-profile .john-title h6 {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .fixed-profile .john-title span {
          font-size: 12px;
          color: #94a3b8;
        }

        .brand-logo {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: ${props => sidebarCollapsed ? 'center' : 'space-between'};
        }

        /* Mobile Close Button */
        .mobile-close-btn {
          background: transparent;
          border: none;
          font-size: 24px;
          color: #64748b;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .mobile-close-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        /* Animation for logo switch */
        .brand-logo img {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;