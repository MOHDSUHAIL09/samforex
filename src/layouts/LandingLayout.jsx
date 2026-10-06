
  import { Routes, Route } from 'react-router-dom';
  import Home from '../Componenets/landing/Home';
  // import Auth from '../Componenets/authComponent/Auth';
  import Dashboard from '../Pages/dashboard/Dashboard';
  import Signup from '../Pages/auth/Signup';
  import Login from '../Pages/auth/Login';
  import ForgotPassword from '../Pages/auth/ForgotPassword';
  // import Header from '../Componenets/common/Header';


  const LandingLayout = () => {

        // const location = useLocation();
    
    // Check if current path is login or signup
    // const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgotpassword' ;


    return (
      <>

      
        {/* {!isAuthPage && <Header/>} */}
        <main className="landing-main">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/login" element={<Auth />} />       
            <Route path="/signup" element={<Auth />} /> */}

              <Route path="/dashboard" element={<Dashboard/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgotpassword" element={<ForgotPassword/>} />

          </Routes>
        </main>
      </>
    )
  }

  export default LandingLayout