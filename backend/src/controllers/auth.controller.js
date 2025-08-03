import mongoose from "mongoose";
import User from "../models/users.models.js"
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup =async (req,res) =>{
    const {fullName,email,password}=req.body;
    try{
        if(!password || !email)
            return res.status(400).json({
                error:true,
                message:"Email and Password required"
            })
        if(password.length < 8)
            return res.status(400).json({
                error:true,
                message:"Password must be of atleast 8 characters "
            })
        
        const user = await User.findOne({email})
        if(user)
            return res.status(400).json({
                error:true,
                message:"Email already exists"
            })

        const salt =await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new User({
            fullName,
            email,
            password:hashedPassword
        })

        if(newUser){
            generateToken(newUser?._id,res)
            await newUser.save()
            res.status(201).json({
                error:false,
                message:"Signup Succesfull",
                data:{
                    _id:newUser?._id,
                    fullName:newUser?.fullName,
                    email:newUser?.email
                }
            })
        }else{
            return res.status(400).json({
                error:true,
                message:"Invalid user data"
            })
        }
    }catch(error){
        console.log("Error in signup controller",error.message)
        return res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }
}

export const login = async(req,res) =>{
    const {email,password} = req.body;
    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                error:true,
                message:"Invalid credentials"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password,user.password)
        if(!isPasswordCorrect){
             return res.status(400).json({
                error:true,
                message:"Invalid credentials"
            })
        }

        generateToken(user._id,res)

        res.status(200).json({
            error:false,
            message:"Login successfull",
            data:{
                id:user._id,
                fullName:user?.fullName,
                email:user?.email,
                profilePic:user.profilePic
            }
        })
    }catch(error){
         console.log("Error in login controller",error.message)
        return res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }
}

export const logout = (req,res) =>{
    try{
        res.cookie("jwt","",{
            maxAge:0,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development"
        })
        res.status(200).json({
            error:false,
            message:"Logged out successfully"
        })
    }catch(error){
        console.log("Error in login controller",error.message)
        return res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }
}

export const updateProfile = async(req,res) => {
    try{
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({
                error:true,
                message:"Profile not not provided"
            })
        }

        const pic = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:pic.secure_url},{new:true});

        return res.status(200).json({
            error:false,
            message:"Profiile pic uploaded"
        })

    }catch(error){
        console.log("error in updateProfile controller",error)
        return res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }
}

export const checkAuth = (req,res) =>{
    try{
        return res.status(200).json({
            error:false,
            data:req.user,
        })
    }catch(error){
        console.log("error in checkAuth controller")
        return res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }
}