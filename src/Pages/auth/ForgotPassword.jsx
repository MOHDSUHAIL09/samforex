import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [loading, setLoading] = useState(false);
  
  //  CUSTOM TOAST STATE
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  //  Show Toast Function
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedId = loginId.trim();
    if (!trimmedId) {
      showToast("Please enter your Login ID");
      return;
    }
    
    setLoading(true);
    
    try {
      //  Send loginId in request body as string
      const response = await apiClient.post("/Auth/ForgetPassword", trimmedId);
    
      const data = response.data;
      
      //  Check main result
      if (data.result === "true" || data.result === true) {
        const responseData = data.response;
        
        //  Check if password was actually sent
        if (responseData?.result === "Failed to send password. Please try again later.") {
          showToast("Failed to send password. Please try again later.", "error");
        } else if (responseData?.isCompletedSuccessfully === true) {
          showToast(" Password recovery instructions sent to your email/phone!", "success");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          showToast(responseData?.result || "Request failed. Please try again.", "error");
        }
      } else {
        showToast(data.message || "Request failed. Please try again.", "error");
      }
      
    } catch (error) {
      console.error("Forgot password error:", error);
      console.error("Error Response:", error.response);
      
      let errorMsg = "Network Error! Please check your connection.";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.response?.result) {
        errorMsg = error.response.data.response.result;
      } else if (error.message) {
        errorMsg = error.message;
      }
      showToast(`${errorMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add('loaded');
    return () => document.body.classList.remove('loaded');
  }, []);

  return (
    <>
      {/*  CUSTOM TOAST - TOP RIGHT WITH ANIMATION */}
      {toast.show && (
        <div className={`custom-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="bd-bg">
        <div className="mediic-appoinment">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-6 d-flex justify-content-lg-center justify-content-start align-items-center">
                <div className="d-flex justify-content-center align-items-center">
                  {/* <img src={authimg} alt="signup-image" /> */}
                </div>
              </div> 
              
              <div className="col-lg-6">
                <div className="auth-form">
                  <div className="mediic-section-title2">
                    <h4>FORGOT PASSWORD</h4>
                    <h3 className="Sign-text">Recover your account</h3>
                  </div>
                  <div className="contact-form-box">
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-lg-12 col-md-12">
                          <div className="form-box">
                            <input
                              type="text"
                              placeholder="Enter Login ID / Wallet Address"
                              value={loginId}
                              onChange={(e) => setLoginId(e.target.value)}
                              required
                            />
                          </div>  
                        </div>
                        
                        <div className="col-lg-12 mb-2">
                          <p className="text-dark">
                            Remember password?{" "}
                            <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
                              <span className="text-primary ms-2">Back to Login</span>
                            </a>
                          </p>
                        </div>
                        
                        <div className="col-lg-12 col-md-6">
                          <div className="submit-button">
                            <button type="submit" className="laboix-btn" disabled={loading}>
                              {loading ? "Sending..." : "Recover Password"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*  TOAST CSS - TOP RIGHT WITH SLIDE ANIMATION */}
      <style jsx>{`
        .custom-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 14px 28px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          z-index: 999999;
          min-width: 280px;
          max-width: 450px;
          text-align: left;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
          animation: slideInRight 0.4s ease-out;
          letter-spacing: 0.3px;
        }

        .custom-toast.success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-left: 5px solid #047857;
        }

        .custom-toast.error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .custom-toast.info {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border-left: 5px solid #1d4ed8;
        }

        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default ForgotPassword;