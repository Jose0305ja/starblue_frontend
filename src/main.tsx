import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--sb-card-bg)',
                color: 'var(--sb-text)',
                border: '1px solid var(--sb-border2)',
                fontFamily: 'Syne, sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#22C55E', secondary: 'var(--sb-card-bg)' } },
              error:   { iconTheme: { primary: '#EF4444', secondary: 'var(--sb-card-bg)' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
