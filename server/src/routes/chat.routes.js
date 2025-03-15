import { Router } from "express";
import { verifyToken } from "../middlewares/authmiddleware.js";
import chatControllers from "../controllers/chat.controller.js";


const router = Router();

router.use(verifyToken);
router.post("/create", chatControllers.createChat);
router.get("/fetch", chatControllers.fetchChats);
router.post("/create-group", chatControllers.createGroup);
router.post("/add-member", chatControllers.addParticipant);
router.post("/leave-group", chatControllers.leaveGroup);
router.post("/rename-group", chatControllers.renameGroup);
router.post("/remove-member", chatControllers.removeParticipant);

export default router;