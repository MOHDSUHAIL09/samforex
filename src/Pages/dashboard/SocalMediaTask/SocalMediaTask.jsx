// SocalMediaTask.jsx
import { useState } from 'react';
import './SocalMediaTask.css';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import toast from 'react-hot-toast';  // ✅ react-hot-toast
import Toast from '../../../Componenets/ui/Toast';  // ✅ Toast Component

const SocalMediaTask = () => {
  // State management
  const [formData, setFormData] = useState({
    url: '',
    appName: ''
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // History button click handler
  const handleHistoryClick = () => {
    navigate('/dashboard/SocalMediaTaskHistory');
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.url || !formData.appName) {
      toast.error('Please fill all fields');
      setLoading(false);
      return;
    }
    
    const regno = sessionStorage.getItem('Regno');
    
    if (!regno) {
      toast.error('Registration number not found');
      setLoading(false);
      return;
    }
    
    try {
      const response = await apiClient.post('/Dashboard/SocialTask', {
        regno: parseInt(regno),
        url: formData.url,
        appName: formData.appName
      });

      const data = response.data;
      console.log("API Response:", data);
      
      if (data.result === "true" || data.result === true) {
        toast.success(data.message || 'Url saved successfully');
        setFormData({ url: '', appName: '' });
      } else {
        toast.error(data.message || 'Something went wrong');
      }
      
    } catch (err) {
      console.error('Error submitting:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Something went wrong';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ TOAST COMPONENT */}
      <Toast />

      <div className="social-task-container">
        {/* Main Form Card */}
        <div className="form-card py-3 rounded-3">
          {/* Header with History Button */}
          <div className="d-flex justify-content-between px-3">
            <div className="form-header">
              <h2 className="text-dark"> Social Media Task</h2>
            </div>
            <button className="btn btn-primary" onClick={handleHistoryClick}>
               History             
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="form-body01 px-4">
            {/* URL Field */}
            <div className="form-group">
              <div className="text-dark mt-4">
                🔗 URL Link
              </div>
              <input
                type="url"
                name="url"
                className="form-input"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://example.com"
                required
              />
            </div>

            {/* App Name Field */}
            <div className="form-group">
              <div className="text-dark mt-3">
                 App Name
              </div>
              <input
                type="text"
                name="appName"
                className="form-input"
                value={formData.appName}
                onChange={handleChange}
                placeholder="Enter app name"
                required
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-btn mb-5 mt-4"
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  Submitting...
                </span>
              ) : (
                'Submit Task →'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default SocalMediaTask;