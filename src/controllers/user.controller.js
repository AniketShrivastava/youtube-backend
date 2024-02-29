import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../model/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshToken = async(userId)=>{
 try {
     const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.refreshAccessToken()
   
      user.refreshToken = refreshToken
     await user.save({ValidatioBeforeSave:false})
   
     return{accessToken,refreshToken}
 } catch (error) {
    throw new ApiError(500,"Somethind went wrong while generating refresh and access token")
 }
}

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
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
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
const loginUser = asyncHandler(async (req, res) => {


    const { email, username, password } = req.body
    console.log(email, username)

    if (!email && !username) {
        throw new ApiError(401, "Email and Username is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exit")
    }

    const isValidPassword = await user.isPasswordCorrect(password)
    if (!isValidPassword) {
        throw new ApiError(404, "Invalid user credential")
    }

    const{accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
     
    const loggedInuser = await User.findById(user._id).select("-password,-refreshToken")

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken", refreshTokenToken,options)
    .json(
        new ApiResponse(200,
            {
                user:loggedInuser,accessToken,refreshToken
            },
            "User is loggedIn successfully"
            )
    )


})
export {
    registerUser,
    loginUser
}