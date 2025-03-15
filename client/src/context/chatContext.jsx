import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext(); 

const ChatProvider = ({ children }) => {
    const [openSideBar, setOpenSideBar] = useState(false);
    const [loginUser, setLoginUser] = useState(
        sessionStorage.getItem("user") ? JSON.parse(sessionStorage.getItem("user")) : null
    );

    const [selectedChat, setSelectedChat] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [MyChats, setMyChats] = useState(null);
    const [chatListRefresh, setChatListRefresh] = useState(false);

    const[openGroupModal, setOpenGroupModal] = useState(false);

    const [openChatInfo, setOpenChatInfo] = useState(false);

    const [isMediumScreen, setIsMediumScreen] = useState(window.innerWidth < 768);

    useEffect(() => {
        // console.log("chatcontext");
    },[])

    // Handle window resize event to update isMediumScreen state
    useEffect(() => {
        const handleResize = () => {
            // console.log(window.innerWidth);
            setIsMediumScreen(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    

    return (
        <ChatContext.Provider
            value={{
                openSideBar,
                setOpenSideBar,
                loginUser,
                setLoginUser,
                selectedChat,
                setSelectedChat,
                notifications,
                setNotifications,
                MyChats,
                setMyChats,
                chatListRefresh,
                setChatListRefresh,
                openGroupModal,
                setOpenGroupModal,
                isMediumScreen,
                setIsMediumScreen,
                openChatInfo,
                setOpenChatInfo
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return context;
};

export { ChatProvider, useChatContext };
