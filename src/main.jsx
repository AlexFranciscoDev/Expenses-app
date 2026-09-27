import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { isSupabaseConfigured } from './lib/supabase.js'
import SetupPage from './pages/SetupPage.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isSupabaseConfigured ? (
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    ) : (
      <SetupPage />
    )}
  </StrictMode>,
)
