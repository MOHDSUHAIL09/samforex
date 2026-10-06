import { useState } from 'react';
import { FaArrowDown, FaRobot, FaShareNodes } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import QRModal from '../../Pages/dashboard/QRModal';
import smalldashboardlogo from '../../assets/images/logo/favicon-01.png'

const userProfileImage = "https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/profile/user-1.jpg";

const Header = ({ toggleSidebar }) => {

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const navigate = useNavigate();

  // Get user data from context
  const { user, userData, logoutUser } = useUser();

  const handleLogout = () => {
    logoutUser();
    navigate('/');


  };

  // Get user name and email from context
  const userName = userData?.fname;
  const userEmail = userData?.email || user?.email || "guest@example.com";
  const loginid = userData?.loginid || user?.loginid;

  // Get regno for referral link
  const regno = userData?.regno || userData?.Regno || sessionStorage.getItem('regno');

  // Get referral link
  const getReferralLink = () => {
    const directId = userData?.directId || userData?.directid || regno || 'TEST123';
    return `${window.location.origin}/signup?ref=${directId}`;
  };

  // QR Modal handlers
  const openQRModal = () => {
    setIsQRModalOpen(true);
  };

  const closeQRModal = () => {
    setIsQRModalOpen(false);
  };

  return (
    <>
      <QRModal
        isOpen={isQRModalOpen}
        onClose={closeQRModal}
        referralLink={getReferralLink()}
        userData={userData}
      />

      <div className="topbar px-4">
        <nav className="navbar navbar-expand p-0">
          <ul className="navbar-nav d-block d-sm-none">
            <li className="nav-item nav-icon-hover-bg rounded-circle ms-n2">
              <Link to="/dashboard">
                <button
                  className="nav-link sidebartoggler"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <img src={smalldashboardlogo} />
                </button>
              </Link>
            </li>
          </ul>

          {/* Left side - Menu Icon for Sidebar Toggle */}
          <ul className="navbar-nav ms-3 ms-ms-0">
            <li className="nav-item nav-icon-hover-bg rounded-circle ms-n2">
              <button
                className="nav-link sidebartoggler"
                onClick={toggleSidebar}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <i className="ti ti-menu-2"></i>
              </button>
            </li>
          </ul>






          {/* Right Side Dropdowns - Always visible */}
          <div className="d-flex align-items-center ms-auto">



            <ul className="navbar-nav flex-row align-items-center" style={{ flexDirection: 'row', display: 'flex' }}>


              <a href="/ApexmindAI.apk" download>
                <li className="nav-item ">
                  <div
                    className="btn01"
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "50%",
                      border: "none",
                      background: 'var(--bs-primary-bg-subtle)',
                      color: "#3e51a5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      cursor: "pointer",
                    }}
                  >
                    <FaArrowDown />
                  </div>
                </li>
              </a>





              {/* Share Button */}
              <li className="nav-item ">
                <div
                  onClick={openQRModal}
                  className="btn01"
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "50%",
                    border: "none",
                    background: 'var(--bs-primary-bg-subtle)',
                    color: "#3e51a5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                >
                  <FaShareNodes />
                </div>
              </li>

              {/* BOT Link */}

              {/* <li className="nav-item">
  <Link
    to="/dashboard/console"
    className="nav-link p-0 d-flex justify-content-center align-items-center"
  >
    <button
      style={{
        width: "45px",
        height: "45px",
        minWidth: "42px",
        borderRadius: "50%",
        border: "none",
        background: "var(--bs-primary-bg-subtle)",
        color: "#3e51a5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <FaRobot size={18} />
    </button>
  </Link>
</li> */}


              {/* Profile Dropdown */}
              <li className="nav-item dropdown" style={{ position: 'relative' }}>
                <button
                  className="pe-0"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    <div className="user-profile-img">
                      <img
                        src={userProfileImage}
                        className="rounded-circle"
                        width="45"
                        height="45"
                        alt="profile"
                      />
                    </div>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="dropdown-backdrop"
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1040,
                      }}
                    />
                    <div
                      className="dropdown-menu show dropdown-menu-end"
                      style={{
                        position: window.innerWidth < 576 ? 'fixed' : 'absolute',
                        top: window.innerWidth < 576 ? '70px' : '100%',
                        right: window.innerWidth < 576 ? '10px' : '0',
                        left: window.innerWidth < 576 ? '10px' : 'auto',
                        width: window.innerWidth < 576 ? 'calc(100vw - 20px)' : '360px',
                        maxWidth: '400px',
                        maxHeight: window.innerWidth < 576 ? 'calc(100vh - 100px)' : 'auto',
                        overflowY: window.innerWidth < 576 ? 'auto' : 'visible',
                        display: 'block',
                        zIndex: 1050,
                        borderRadius: window.innerWidth < 576 ? '16px' : '12px',
                        boxShadow: window.innerWidth < 576 ? '0 10px 40px rgba(0,0,0,0.2)' : '0 5px 20px rgba(0,0,0,0.15)',
                        padding: 0,
                      }}
                    >
                      <div className="profile-dropdown position-relative" data-simplebar>
                        {/* User Info Section */}
                        <div className="d-flex align-items-center py-9 mx-7 border-bottom">
                          <img
                            src={userProfileImage}
                            className="rounded-circle"
                            width={window.innerWidth < 576 ? "60" : "80"}
                            height={window.innerWidth < 576 ? "60" : "80"}
                            alt="profile"
                          />
                          <div className="ms-3">
                            <h5 className="mb-1 fs-3">{userName}</h5>
                            {loginid && (
                              <span className="mb-1 d-block text-muted">Login Id: <span style={{ color: "green" }}>{loginid}</span></span>
                            )}
                            <div className="mb-0 d-flex align-items-center gap-2">
                              <i className="ti ti-mail"></i>
                              <span style={{ fontSize: '12px' }}>{userEmail}</span>
                            </div>
                          </div>
                        </div>

                        <div className="message-body">
                          <Link to="/dashboard/changepassword" className=" px-7 d-flex align-items-center" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setProfileDropdownOpen(false)}>
                            <span className="d-flex align-items-center justify-content-center text-bg-light rounded-1 p-6">
                              <img src="https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/svgs/icon-tasks.svg" alt="icon" width="24" height="24" />
                            </span>
                            <div className="w-100 ps-3">
                              <h6 className="mb-1  fw-semibold lh-base">Change Password</h6>
                              {/* <span className="d-block text-body-secondary">Forget Password</span> */}
                            </div>
                          </Link>

                          <Link to="/dashboard/support" className=" px-7 d-flex align-items-center" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setProfileDropdownOpen(false)}>
                            <span className="d-flex align-items-center justify-content-center text-bg-light rounded-1 p-6">
                              <img src="https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/svgs/icon-inbox.svg" alt="icon" width="24" height="24" />
                            </span>
                            <div className="w-100 ps-3">
                              <h6 className="mb-1  fw-semibold lh-base">Support</h6>
                              {/* <span className=" d-block text-body-secondary">Messages & Emails</span> */}
                            </div>
                          </Link>

                          <Link to="/dashboard/profile" className="px-7 d-flex align-items-center" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setProfileDropdownOpen(false)}>
                            <span className="d-flex align-items-center justify-content-center text-bg-light rounded-1 p-6">
                              <img src="https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/svgs/icon-tasks.svg" alt="icon" width="24" height="24" />
                            </span>
                            <div className="w-100 ps-3">
                              <h6 className="fw-semibold lh-base">Profile</h6>
                              {/* <span className="d-block text-body-secondary">Update profile</span> */}
                            </div>
                          </Link>
                        </div>

                        <div className="d-grid py-4 px-7 pt-8">
                          <div className="upgrade-plan bg-primary-subtle position-relative overflow-hidden rounded-4 p-4 mb-9">
                            <div className="row">
                              <div className="col-6">
                                <h5 className=" mb-3 fw-semibold">Max Invest $5000</h5>
                                <Link to="/dashboard/InvestFund"><button className="btn-primary">Invest</button></Link>
                              </div>
                              <div className="col-6">
                                <div className="m-n4 unlimited-img">
                                  <img src="https://bootstrapdemos.adminmart.com/modernize/dist/assets/images/backgrounds/unlimited-bg.png" alt="unlimited" className="w-100" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <button className="btn btn-outline-primary" onClick={handleLogout}>
                            Log Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;