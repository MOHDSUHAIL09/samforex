import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import DashboardLayout from './layouts/DashboardLayout';
import LandingLayout from './layouts/LandingLayout';
import { ToastContainer } from 'react-toastify';

const AppRoutes = () => {
  const { isAuthenticated } = useUser();
  return (
    <>

     <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    
    <Routes>
      <Route 
        path="/*" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingLayout />} 
      />
      <Route 
        path="/dashboard/*" 
        element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/" replace />} 
      />
    </Routes>
     </>
  );
};

const App = () => {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
};

export default App;