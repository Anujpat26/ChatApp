import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config() 

export const generateToken = (userId, res) => {
    const token = jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"3d"
    })

    res.cookie("jwt",token,{
        maxAge: 3*24*60*60*1000, //ms
        httpOnly:true, // prevents XSS attacks cross-site scripting attacks
        sameSite:"strict", // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "developement"
    })

    return token;
}