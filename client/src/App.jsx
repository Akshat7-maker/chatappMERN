import './App.css';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import SearchSideBar from './components/SearchSideBar';
import { useChatContext } from './context/chatContext';
import { useEffect } from 'react';
import GroupChat from './components/chat/GroupChat';

function App() {

  const {loginUser, setLoginUser} = useChatContext();

  const navigate = useNavigate();

  useEffect(() => {
    if (!loginUser) {
      navigate("/login");
    }
  }, [loginUser, navigate]);

  // if (!loginUser) {
  //   navigate("/login");
  //   return 
  // }
  return (
    <>
      <Toaster />
      <Navbar />
      <SearchSideBar />
      <Outlet />
      
    </>
  );
}

export default App;
