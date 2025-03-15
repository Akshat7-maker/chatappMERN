import { Router } from "express";
import { verifyToken } from "../middlewares/authmiddleware.js";
import messageControllers from "../controllers/message.controller.js";
import { upload } from "../middlewares/multermiddleware.js";

const router = Router();

router.use(verifyToken);

router.post("/send/:chatId", upload.single("file"), messageControllers.sendMessage);
router.get("/all/:chatId", messageControllers.allMessages);
router.post("/mark-read/:chatId", messageControllers.markMessagesAsRead);

export default router; 