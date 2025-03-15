import { Router } from "express";
import userControllers from "../controllers/user.controller.js";
import { upload } from "../middlewares/multermiddleware.js";
import { verifyToken } from "../middlewares/authmiddleware.js";

const router = Router();


router.post("/register", upload.single("profilePic"), userControllers.registerUser);
router.post("/login", userControllers.loginUser);
router.post("/logout", verifyToken, userControllers.logoutUser);
router.get("/search" ,verifyToken, userControllers.searchUsers);

export default router;