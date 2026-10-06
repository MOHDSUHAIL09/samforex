// src/components/ChangePassword.jsx
import { useState } from 'react';
import apiClient from '../../../api/apiClient';

const ChangePassword = () => {
  const regno = sessionStorage.getItem('Regno');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  //  CUSTOM TOAST STATE
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  //  Show Toast Function - Top Right with Animation
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleUpdatePassword = async () => {
    if (loading) return;
    
    if (!currentPassword) {
      showToast('Please enter current password', 'error');
      return;
    }
    if (!newPassword) {
      showToast('Please enter new password', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirm password do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    if (currentPassword === newPassword) {
      showToast('New password cannot be same as current password', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.put('/Auth/UpdatePassword', {
        regno: regno,
        password: newPassword
      });
      
      const isSuccess = response.data?.result === "true" || response.data?.result === true;
      
      if (isSuccess) {
        const successMsg = response.data?.response || 'Password updated successfully!';
        showToast(` ${successMsg}`, 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorMsg = response.data?.message || response.data?.response || 'Password update failed';
        showToast(` ${errorMsg}`, 'error');
      }
    } catch (error) {
      console.error(' Error:', error);
      let errorMsg = 'Failed to update password';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.response) {
        errorMsg = error.response.data.response;
      } else if (error.message) {
        errorMsg = error.message;
      }
      showToast(` ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password change cancelled', 'info');
  };

  const isUpdateDisabled = loading || !currentPassword || !newPassword || !confirmPassword || 
                           newPassword !== confirmPassword || newPassword.length < 8;

  return (
    <>
      {/*  CUSTOM TOAST - TOP RIGHT WITH SLIDE ANIMATION */}
      {toast.show && (
        <div className={`custom-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-none border">
            <div className="card-body">
              <h4 className="mb-4">Change Password</h4>

              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 8 characters)"
                  className="form-control"
                />
                {newPassword && newPassword.length < 8 && (
                  <small className="text-danger">Password must be at least 8 characters</small>
                )}
                {newPassword && newPassword.length >= 8 && (
                  <small className="text-success"> Password strength: Good</small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="form-control"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <small className="text-danger">Passwords do not match</small>
                )}
                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
                  <small className="text-success"> Passwords match</small>
                )}
              </div>

              <div className="d-flex gap-2">
                <button 
                  onClick={handleUpdatePassword} 
                  disabled={isUpdateDisabled}
                  className="btn btn-primary flex-grow-1"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
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
        }

        .custom-toast.error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border-left: 5px solid #b91c1c;
        }

        .custom-toast.info {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border-left: 5px solid #1d4ed8;
        }

        /*  SLIDE IN FROM RIGHT ANIMATION */
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

        /*  SLIDE OUT TO RIGHT */
        .custom-toast.hide {
          animation: slideOutRight 0.3s ease-in forwards;
        }

        @keyframes slideOutRight {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default ChangePassword;