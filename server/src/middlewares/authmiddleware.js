import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import User from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

const verifyToken = asyncHandler(async (req, res, next) => {
    try {
        // console.log("verifying token", req.cookies.accessToken, req.headers.authorization, req.headers["x-access-token"]);

        // const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1] || req.headers["x-access-token"];
        const token = req.cookies.refreshToken || req.headers.authorization?.split(" ")[1] || req.headers["x-access-token"];
        // console.log("cookies", req.cookies.accessToken);
        // console.log("token", token);
        if (!token) {
            throw new ApiError(401, "Unauthorized");
        }

        const decoded =  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        // console.log("decoded", decoded);

        const user = await User.findById(decoded._id);
        if (!user) {
            throw new ApiError(401, "Unauthorized ");
        }

        req.user = user;
        next();
        
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Token expired. Please log in again.");
        } else if (error.name === "JsonWebTokenError") {
            throw new ApiError(401, " You are Unauthorized user.");
        } else {
            throw new ApiError(401, "Unauthorized user.");
        }
        
    }
});

export { verifyToken }