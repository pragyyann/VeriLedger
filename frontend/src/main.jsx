import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { UserProvider } from './context/UserContext'
import './index.css'
import App from './App.jsx'

const GOOGLE_CLIENT_ID = '178702966827-5g4st8snnunci0qtu2gdq36ljbaoe0es.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <UserProvider>
        <App />
      </UserProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
