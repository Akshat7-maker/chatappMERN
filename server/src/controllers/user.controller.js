import asyncHandler from "../utils/asynchandler.js";
import User from "../models/user.model.js";
import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary.js";


const registerUser = asyncHandler(async (req, res) => {
    // console.log(req);
    const { name, email, password } = req.body;
    console.log(name, email, password);

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(400, "User already exists");
    } 

    // check if user has profile pic
    const profilePic = req.file ? req.file.path : null;

    let userProfilePic
    if(profilePic){
        userProfilePic = await uploadOnCloudinary(profilePic)
        // console.log(userProfilePic)
        if(!userProfilePic) return res.status(500).json(new ApiError(500, "Something went wrong"))
    }



    const user = await User.create({
        name,
        email,
        password,
        profilePic : profilePic ? userProfilePic.url : "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    });
    return res
    .status(201)
    .json(new ApiResponse(201, user));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
    }
    const accessToken = await user.generateAcessToken();
    const refreshToken = await user.generateRefreshToken();
    
    user.refreshToken = refreshToken;
    await user.save();

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    }
    
    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, user));
        
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findOneAndUpdate(
        { _id: req.user._id },
        { refreshToken: null },
        { new: true }
    )

    return res
        .status(200)
        .clearCookie("refreshToken")
        .clearCookie("accessToken")
        .json(new ApiResponse(200, "User logged out"));
});


const searchUsers = asyncHandler(async (req, res) => {
    
    // user will be able to search users by name or email
    const {search} = req.query;
    // console.log(search)
    
    const searchQuery = search ? {
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ],
    } : {};
    // console.log(req.user._id)

    const users = (await User.find({
        ...searchQuery,
        _id: { $ne: req.user._id },
    }))

    return res.status(200).json(new ApiResponse(200, users));
});

const userControllers = {
     registerUser,
     loginUser,
     logoutUser,
     searchUsers
    };
export default userControllers;