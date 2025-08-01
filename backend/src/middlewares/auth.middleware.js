import jwt from "jsonwebtoken";
import User from "../models/users.models.js";

export const protectRoute = async (req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        if(!token){
            return res.status(400).json({
                error:true,
                message:"Unauthorised"
            })
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        if(!decoded){
            return res.status(400).json({
                error:true,
                message:"Unauthorised"
            })
        }
        console.log("decpded ",decoded)

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(400).json({
                error:true,
                message:"User not found"
            })
        }

        req.user = user;
        next()

    }catch(error){
        console.log("error in auth middleware",error)
        return res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }
}