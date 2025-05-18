import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { FirestoreProvider } from './contexts/FirestoreContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <FirestoreProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </FirestoreProvider>
  </StrictMode>,
);