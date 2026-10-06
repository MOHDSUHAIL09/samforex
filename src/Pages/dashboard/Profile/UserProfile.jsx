import { useState, useEffect } from 'react';
import { useUser } from '../../../context/UserContext';
import apiClient from '../../../api/apiClient';
import toast from 'react-hot-toast';
import Toast from '../../../Componenets/ui/Toast';

const UserProfile = () => {
  const { userData } = useUser();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // ✅ OTP States
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [formData, setFormData] = useState({
    loginId: "",
    address: "",
    fullName: "apexmindai",
    emailId: "",
    mobileNumber: "",
    firstName: "",
    lastName: "",
    walletAddress: ""
  });

  useEffect(() => {
    if (!userData) return;

    const fullName = userData?.fname || "";
    const nameParts = fullName.split(" ");

    setFormData(prev => ({
      ...prev,
      loginId: sessionStorage.getItem("loginId") || userData?.loginid || "",
      address: userData?.TokenAddress || userData?.address || "",
      fullName: prev.fullName || fullName,
      firstName: prev.firstName || nameParts[0] || "",
      lastName: prev.lastName || nameParts.slice(1).join(" "),
      emailId: prev.emailId || userData?.email || "",
      mobileNumber: prev.mobileNumber || userData?.MobileNo || userData?.mobile || "",
      walletAddress: prev.walletAddress || userData?.walletid || userData?.walletAddress || "",
    }));

    setLoading(false);
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Send OTP Function
  const handleSendOTP = async () => {
    try {
      const loginId = sessionStorage.getItem("loginId");
      const regNo = sessionStorage.getItem("Regno");

      if (!loginId || !regNo) {
        toast.error("Login ID or Registration number not found");
        return;
      }

      setOtpLoading(true);
      setOtpVerified(false);
      setOtp(""); // Clear previous OTP
      
      const response = await apiClient.post('/Auth/genrate-otp', null, {
        params: { loginid: loginId, regno: regNo }
      });

      if (response.data.result === "true") {
        toast.success(response.data.message || "OTP sent successfully!");
        setOtpSent(true);
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // ✅ Verify OTP Function
  const handleVerifyOTP = async () => {
    try {
      if (!otp || otp.length < 6) {
        toast.error("Please enter valid 6-digit OTP");
        return;
      }

      const loginId = sessionStorage.getItem("loginId");
      const regNo = sessionStorage.getItem("Regno");

      if (!loginId || !regNo) {
        toast.error("Login ID or Registration number not found");
        return;
      }

      setOtpLoading(true);
      const response = await apiClient.post('/Auth/verify-otp', null, {
        params: { loginid: loginId, regno: regNo, otp: otp }
      });

      if (response.data.result === "true") {
        toast.success("OTP Verified Successfully");
        setOtpVerified(true);
        setOtpSent(false); // Hide OTP input after verification
      } else {
        setOtpVerified(false);
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      setOtpVerified(false);
      toast.error(error?.response?.data?.message || "OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUpdating) {
      toast.error("Please wait...");
      return;
    }

    // ✅ Check if OTP is verified
    if (!otpVerified) {
      toast.error("Please verify OTP first before updating profile");
      return;
    }

    // if (!formData.fullName) {
    //   toast.error("Full name is required");
    //   return;
    // }
    if (!formData.emailId) {
      toast.error("Email ID is required");
      return;
    }
    if (!formData.mobileNumber) {
      toast.error("Mobile number is required");
      return;
    }

    setIsUpdating(true);

    try {
      const regNo = sessionStorage.getItem("Regno");

      if (!regNo) {
        toast.error("Registration number not found!");
        setIsUpdating(false);
        return;
      }

      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(' ') || "";

      const requestData = {
        regNo: parseInt(regNo),
        emailID: formData.emailId,
        address: formData.address,
        firstName: firstName,
        lastName: lastName,
        mobile: formData.mobileNumber,
        stateId: 0,
        cityId: 0,
        pinCode: "0",
        alternateContactNo: "",
        walletAddress: formData.walletAddress || ""
      };


      const response = await apiClient.put('/Auth/UpdateProfile', requestData);


      if (response.data?.result === "true" || response.data?.result === true ||
        response.data?.response === true || response.data?.response === "true") {

        toast.success("✅ Profile updated successfully!");

        // sessionStorage.setItem("userName", formData.fullName);
        sessionStorage.setItem("userEmail", formData.emailId);
        if (formData.walletAddress) {
          sessionStorage.setItem("walletAddress", formData.walletAddress);
        }
        if (formData.address) {
          sessionStorage.setItem("tokenAddress", formData.address);
        }
        
        // ✅ Reset OTP states after successful update
        setOtp("");
        setOtpSent(false);
        setOtpVerified(false);

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("❌ Update failed: " + (response.data?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Full error:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error(error.response?.data?.message || "API Error - Please try again");
      }
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="body-wrapper">
      <Toast />
      <div className="container">
        <div className="row mt-4">
          <div className="col-lg-8">
            <form onSubmit={handleSubmit}>
              <div className="card">
                <div className="card-body">
                  <h4 className="mb-4">Profile Information</h4>

                  <div className="mb-3">
                    <label>Login ID</label>
                    <input 
                      style={{ color: "green" }}
                      type="text"
                      value={formData.loginId}
                      className="form-control bg-light"
                      disabled
                    />
                  </div>

                  {/* <div className="mb-3 ">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="form-control"
                      required
                      placeholder="Enter your full name"
                    />
                  </div> */}

                  <div className="mb-3">
                    <label>Email ID *</label>
                    <input
                      type="email"  
                      name="emailId"
                      value={formData.emailId}
                      onChange={handleChange}
                      className="form-control"
                      required
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="form-control"
                      required
                      placeholder="Enter your mobile number"
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                    />
                  </div>

                  <div className="mb-3">
                    <label>Income Payout Wallet Address</label>
                    <input
                      type="text"
                      name="walletAddress"
                      value={formData.walletAddress || ""}
                      onChange={handleChange}
                      className="form-control"
                      style={{ color: formData.walletAddress ? "green" : "#999" }}
                      placeholder="Enter your wallet address"
                    />
                  </div>

                  <div className="mb-3">
                    <label>Token Payout Address</label>
                    <input
                      type="text"
                      placeholder='Enter Token Address'
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      className="form-control"
                      style={{ color: formData.address ? "green" : "#999" }}
                    />
                  </div>

                  {/* ✅ OTP SECTION - IMPROVED */}
                  <div className="mb-3 p-3" style={{ 
                    backgroundColor: otpVerified ? '#d4edda' : '#f8f9fa',
                    borderRadius: '8px',
                  }}>
                    <label className="fw-bold mb-2">
                      OTP Verification 
                    </label>
                    
                    <div className="d-flex gap-2">
                      <div className="flex-grow-1">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          disabled={!otpSent || otpVerified}
                          maxLength="6"                      
                        />
                      </div>
                      
                      {!otpVerified && (
                        !otpSent ? (
                          <button
                            type="button"
                            className="btn btn-primary text-nowrap"
                            onClick={handleSendOTP}
                            disabled={otpLoading}
                          >
                            {otpLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1"></span>
                                Sending...
                              </>
                            ) : (
                              "Send OTP"
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-success text-nowrap"
                            onClick={handleVerifyOTP}
                            disabled={otpLoading || otp.length < 6}
                          >
                            {otpLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1"></span>
                                Verifying...
                              </>
                            ) : (
                              "Verify OTP"
                            )}
                          </button>
                        )
                      )}
                    </div>

                  </div>

                  {/* ✅ UPDATE BUTTON - COMPLETELY DISABLED UNTIL OTP VERIFIED */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    style={{
                      backgroundColor: otpVerified ? '#007bff' : '#6c757d',
                      color: 'white',
                      cursor: otpVerified ? 'pointer' : 'not-allowed',
                      opacity: otpVerified ? 1 : 0.7,
                      transition: 'all 0.3s ease'
                    }}
                    disabled={isUpdating || !otpVerified}
                    onMouseEnter={(e) => {
                      if (!otpVerified) {
                        e.target.title = "Please verify OTP first";
                      }
                    }}
                  >
                    {isUpdating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        UPDATING...
                      </>
                    ) : (
                      <>
                        {otpVerified ? ' UPDATE PROFILE' : 'UPDATE PROFILE'}
                      </>
                    )}
                  </button>

  
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;