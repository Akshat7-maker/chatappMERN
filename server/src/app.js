import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import {Server} from "socket.io";  
import {createServer} from "http";
import path from "path";

const app = express();
 
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: { 
        origin: "http://localhost:8000",
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"], 
    }
})

const __dirname = path.resolve();

const onlineUsers = new Map(); // map to store online users


// listen for socket connection
io.on("connection", (socket) => {
    // console.log("A user connected", socket.id)

    // adding user to onlineUsers map when user logins 
    socket.on("user-is-online", (user) => {
        // console.log("user is online", user._id);
        onlineUsers.set(user._id, socket.id);
        // console.log(onlineUsers);  

        socket.emit("you-are-online", user.name);
    })

    // joining a room at time of login
    socket.on("join-chats", ({userId, chatRooms}) => {
        chatRooms.forEach((chatId) => {
            socket.join(chatId);
        }) 

        // emit a success message to user
        socket.emit("join-chats-success", "success");
    })

    // sending message to room
    socket.on("send-message", ({ message, chatId, reciverId }) => {

        // check is chat is group chat or not
        io.to(chatId).emit("receive-message", message);

    })
 
    // mark message as read
    socket.on("message-read", async ({ chatId, readByUserId, senderIds }) => {

        // update db so that message is marked as read here only 
        for (const senderId of senderIds) {
            await Message.updateMany(
                { chat: chatId, sender: senderId, readby: { $nin: [readByUserId] } },
                { $push: { readby: readByUserId } }
            )
        }

        // check if reciver is online 
        // if (onlineUsers.has(senderId)) {
        //     socket.to(onlineUsers.get(senderId)).emit("message-read-success", { chatId, userId, reciverId });
        // }

        socket.to(chatId).emit("message-read-success", { chatId, readByUserId, senderIds });

        // also emit i have read message to sender
        socket.emit("i-have-read-message", { chatId, readByUserId, senderIds });

        
    }) 

    // search users
    socket.on("search-users", async ({ query, userId}) => {

        try {
            const users = await User.find({
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { email: { $regex: query, $options: "i" } },
                ],
                _id: { $ne: userId },
            })
            
            setTimeout(() => {
                socket.emit("search-results", { users });
            },1000)
        } catch (error) {
            console.log(error);
            socket.emit("search-results-error", error.message);
            
        }
        
    })

    // typing
    socket.on("typing", ({ chatId, userId }) => {
        socket.to(chatId).emit("typing", { userId, chatId });
    })

    // stop typing
    socket.on("stop-typing", ({ chatId , userId}) => {
        socket.to(chatId).emit("stop-typing", { userId, chatId });
    })
})
app.use(cors({  
    // origin: process.env.CORS_ORIGIN,
    origin: "http://localhost:8000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true}));
app.use(express.static("public"));
// app.use(morgan("dev"));
app.use(cookieParser());

// import routes
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";
import Message from "./models/message.model.js";
import User from "./models/user.model.js";


// declare routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/message", messageRoutes);

app.use(express.static(path.join(__dirname, "/client/dist")));
app.get("*", (_, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
})

 
export {app, httpServer, io};



// tasklist | findstr node
// taskkill /IM node.exe /F