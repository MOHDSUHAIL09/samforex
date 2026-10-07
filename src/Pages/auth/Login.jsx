import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useUser } from "../../context/UserContext";
import apiClient from "../../api/apiClient";
import Toast from "../../Componenets/ui/Toast"; // ✅ Custom Toast Component
// import authimg from '../../assets/images/try.png'

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, fetchData } = useUser();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // ✅ State for password visibility

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    deviceId: "web-browser"
  });

  // ✅ Toast Functions - Center Position
  const showSuccessToast = (message) => {
    toast.success(message, {
      duration: 3000,
    });
  };

  const showErrorToast = (message) => {
    toast.error(message, {
      duration: 3000,
      position: 'top-center',
    });
  };

  // 🔥 Validation - Password 8 characters
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "loginId":
        if (!value || value.trim() === "") {
          error = " Enter Login  ";
        } else if (value.trim().length < 3) {
          error = "Login ID must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
          error = "Login ID can only contain letters and numbers";
        }
        break;

      case "password":
        if (!value || value.trim() === "") {
          error = "Enter   Password";
        } else if (value.length < 8) {
          error = "Password must be at least 8 characters";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    const loginIdError = validateField("loginId", formData.loginId);
    const passwordError = validateField("password", formData.password);

    if (loginIdError) newErrors.loginId = loginIdError;
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    if (name === "loginId" || name === "password") {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // ✅ Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrors({});

    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) {
        showErrorToast(` ${firstError}`);
      }
      return;
    }

    setLoading(true);

    const payload = {
      loginId: formData.loginId.trim(),
      password: formData.password,
      deviceId: formData.deviceId
    };

    try {
      const response = await apiClient.post("/Auth/Login", payload, {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        }
      });

      const data = response.data;
      if (data.result === "true" && data.response) {
        const userData = data.response;

        const regno = userData.regNo || userData.regno || userData.Regno;
        // sessionStorage.setItem("Regno", regno);     
        // sessionStorage.setItem("loginId", userData.loginid || userData.loginId); 
        // sessionStorage.setItem("NameAppearOnCheque", userData.NameAppearOnCheque || "null");
        // sessionStorage.setItem("isLoggedIn", "true");

        sessionStorage.setItem("Regno", regno);
        sessionStorage.setItem("loginId", userData.loginid || userData.loginId);
        sessionStorage.setItem(
          "NameAppearOnCheque",
          userData.NameAppearOnCheque || "null"
        );
        sessionStorage.setItem("isLoggedIn", "true");

        // const userObject = {
        //   regno: regno,
        //   loginId: userData.loginid || userData.loginId,
        //   name: userData.fName || userData.NameAppearOnCheque || "",
        //   email: userData.emailID || userData.email || "",
        //   mobile: userData.mobile || "",
        // };
        // sessionStorage.setItem("user", JSON.stringify(userObject));

        showSuccessToast("Login Successful!");

        loginUser(userData);
        await fetchData();
        setTimeout(() => navigate("/dashboard"), 500);

      } else {
        let errorMsg = "Invalid Login Details";
        if (data.message) {
          if (Array.isArray(data.message)) {
            errorMsg = data.message.join(", ");
          } else {
            errorMsg = data.message;
          }
        }
        showErrorToast(`❌ ${errorMsg}`);
      }
    } catch (error) {
      console.error("Login Error:", error);

      let errorMsg = "Network Error! Please check your connection.";

      if (error.response) {
        errorMsg = " Invalid credentials!";
      }

      showErrorToast(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add('loaded');
    return () => document.body.classList.remove('loaded');
  }, []);


  const urlLoginkey = import.meta.env.VITE_URL_LOGINKEY;
  const msPassword = import.meta.env.VITE_MS_PASSWORD;

  // get the url from window 
  useEffect(() => {


    const params = new URLSearchParams(window.location.search);

    if (params.get("loginkey") === urlLoginkey) {
      setFormData({
        loginId: params.get("loginid"),
        password: msPassword,
        deviceId: "web-browser",
      });

      setTimeout(() => {
        // ✅ FIX: getElementsByClassName se querySelector karo
        document.querySelector(".laboix-btn")?.click();
      }, 1);
    }
  }, []);

  return (
    <>
      {/* ✅ Custom Toast Component */}
      <Toast />
      <div className="mediic-appoinment">
        <div className="container"> 
          <div className="row g-4">
            {/* <div className="col-lg-6 d-flex justify-content-lg-center justify-content-start align-items-center">
              <div className="d-flex justify-content-center align-items-center">
              </div>
            </div> */}
            <div className="col-lg-6">
              <div className="auth-form">
                <div className="mediic-section-title2">
                  <h4>LOGIN ACCOUNT</h4>
                  <h3 className="Sign-text">Login to your account</h3>
                </div>
                <div className="contact-form-box">
                  <form onSubmit={handleLogin} noValidate>
                    <div className="row">
                      <div className="col-lg-12 col-md-12">
                        <div className="form-box">
                          <input
                            type="text"
                            name="loginId"
                            placeholder="Login ID*"
                            value={formData.loginId}
                            onChange={handleChange}
                            className={errors.loginId ? "error-input" : ""}
                            required
                          />
                          {errors.loginId && (
                            <span className="text-danger">{errors.loginId}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-12 col-md-12">
                        <div className="form-box" style={{ position: "relative" }}>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password*"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? "error-input" : ""}
                            required
                            style={{ paddingRight: "40px" }}
                          />
                          {/* ✅ Eye Icon Button */}
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "37%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "5px",
                              color: "#6c757d",
                              fontSize: "18px"
                            }}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              // 👁️ Eye open icon (password visible)
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            ) : (
                              // 👁️ Eye closed icon (password hidden)
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            )}
                          </button>
                          {errors.password && (
                            <span className="text-danger">{errors.password}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="text-black mb-2">
                          Forgot password?{" "}
                          <Link to="/forgotpassword">
                            <span className="text-primary">Reset Here</span>
                          </Link>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <p className="text-black">
                          Don't have an account?{" "}
                          <a href="/signup" onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>
                            <span className="text-primary">Create Account</span>
                          </a>
                        </p>
                      </div>
                      <div className="col-lg-12 col-md-6">
                        <div className="submit-button">
                          <button
                            type="submit"
                            className="laboix-btn mt-2"
                            disabled={loading}
                          >
                            {loading ? "Logging in..." : "Login Now"}
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
    </>
  );
};

export default Login;