import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../model/user.model.js";

export const verifyJwt = asyncHandler(async(req,res,next)=>{
    try {

       const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("bearer","")

       if(!token){
        throw new ApiError(401,"unAuthorized request")
       }
      const decodedToke =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

    const user = await  User.findById(decodedToke?._id).select("-password -refreshToken")
    if(!user){
        throw new ApiError(401,"Invalid access token")
        
    }
    req.user = user
next()
    } catch (error) {
        throw new ApiError(401 ,error?.message || "Invalid access token")
    }
})