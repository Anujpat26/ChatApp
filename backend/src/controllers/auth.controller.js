import mongoose from "mongoose";
import User from "../models/users.models.js"
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";

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
            await newUser.save
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

export const login = (req,res) =>{
    res.send("login controller")
}

export const logout = (req,res) =>{
    res.send("logout controller")
}