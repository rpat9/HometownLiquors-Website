import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { FirestoreProvider } from './contexts/FirestoreContext.jsx'
import { CartProvider } from './contexts/CartContext.jsx'
import { Toaster } from 'react-hot-toast';
import { ReportProvider } from './contexts/ReportContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <FirestoreProvider>
        <AuthProvider>
          <ReportProvider>
            <CartProvider>
              <App />
              <Toaster position="top-center" reverseOrder={false} />
            </CartProvider>
          </ReportProvider>
        </AuthProvider>
      </FirestoreProvider>
  </StrictMode>,
);