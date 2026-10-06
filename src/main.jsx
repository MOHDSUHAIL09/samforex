
import { createRoot } from 'react-dom/client'  // ✅ "from" add kiya
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import App from './App.jsx'
import './App.css'
import './index.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <UserProvider>
          <App />
      </UserProvider>
  </BrowserRouter>
)