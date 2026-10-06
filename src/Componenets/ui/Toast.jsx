// components/Toast.jsx
import { Toaster } from 'react-hot-toast';

const Toast = () => {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          zIndex: 9999999,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            animation: 'slideInRight 0.4s ease-out',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
              color: 'white',
              boxShadow: '0 8px 30px rgba(16, 185, 129, 0.3)',
              animation: 'slideInRight 0.4s ease-out',
            },
          },
          error: {
            duration: 3000,
            style: {
              background: '#ef4444',
              color: 'white',
              boxShadow: '0 8px 30px rgba(239, 68, 68, 0.3)',
              animation: 'slideInRight 0.4s ease-out',
            },
          },
        }}
      />

      {/* ✅ Inline CSS - Animation */}
      <style>{`
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
        
        .go2072408551 {
          animation: slideInRight 0.4s ease-out !important;
        }
        
        .go2072408551.removing {
          animation: slideOutRight 0.3s ease-in !important;
        }
      `}</style>
    </>
  );
};

export default Toast;