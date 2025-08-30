import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'      
import { AuthProvider } from '../context/AuthContext.jsx'
import { ChatContext, ChatProvider } from '../context/ChatContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AuthProvider>
   <ChatProvider>
      <App />
   </ChatProvider>    
  </AuthProvider>
 </BrowserRouter>,

)