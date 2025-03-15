import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ChatProvider } from './context/chatContext.jsx';
import { SocketProvider } from './context/socketContext.jsx';
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import HomeLayout from './layouts/HomeLayout.jsx';
import Login from './components/authentication/Login.jsx';
import ChatApp from './components/chat/Chatapp.jsx';
import SignUp from './components/authentication/Signup.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} >
      <Route path="" element={<HomeLayout />} />
      <Route path="login" element={<Login />} />
      <Route path='signup' element={<SignUp />} />
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  
    <ChatProvider>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
    </ChatProvider>

    // <ChatApp />

)
