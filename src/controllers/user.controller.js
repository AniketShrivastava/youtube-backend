import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../model/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { fullName, email, username, password } = req.body
    console.log("email:", email)

    if (
        [fullName, email, password, username].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    const exitedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (exitedUser) {
        throw new ApiError(409, "User with email or username is already exits")
    }
    // console.log(req.files)

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImagePath = req.files?.coverImage[0]?.path;


    let coverImagePath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
         coverImagePath = req.files.coverImage[0].path
    }

    // console.log(avatarLocalPath)
    // console.log(coverImagePath)


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar files is required")
    }

    const avatar = await uploadonCloudinary(avatarLocalPath)
    const coverImage = await uploadonCloudinary(coverImagePath)
    console.log(avatar)
    console.log(coverImage)


    if (!avatar) {
        throw new ApiError(400, "Avatar file is require")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    console.log(user)

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "something want to wrong while registered the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User is registered successfully")
    )
}
)
export { registerUser }