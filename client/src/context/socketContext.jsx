import { createContext, useContext, useState, useEffect } from "react";
import { useChatContext } from "./chatContext";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { loginUser } = useChatContext();

    useEffect(() => {
        // console.log("loginUserSocket", loginUser);
        // console.log("socketcontext", socket);
        if (loginUser) {
           const socketConnect = io("http://localhost:8000",{
            withCredentials: true
           });
           
        //    console.log("socketConnect", socketConnect);
           socketConnect.on("connect", () => {
               socketConnect.emit("user-is-online", loginUser);
            })

            setSocket(socketConnect);
        }

        return () => { 
            if (socket) {
                socket.disconnect();
            }
        }

    }, [loginUser]);

    useEffect(() => {
        if (socket) {
            socket.on("you-are-online", (name) => {
                toast.success(`${name} is online`);
            });
            socket.on("user-is-offline", (userId) => {
                toast.error(`${userId} is offline`);
            });
        }
    }, [socket]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

const useSocketContext = () => {
    const context = useContext(SocketContext);
    return context;
};

export { SocketProvider, useSocketContext };