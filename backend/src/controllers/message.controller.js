import cloudinary from "../lib/cloudinary.js";
import Message from "../models/messages.models.js";
import User from "../models/users.models.js";


export const getUsersForSideBar = async(req,res)=>{
    try{
        const loggedInUser = req.user._id;
        const otherUser  = await User.find({
            _id:{
                $ne:loggedInUser
            }
        }).select("-password");

        if(otherUser.length==0){
            return res.status(400).json({
                error:true,
                message:"No other user found"
            })
        }

        return res.status(200).json({
            error:false,
            data:otherUser,
        })

    }catch(error){
        console.log("Error in getUsersForSideBar controller");
        return res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }
}

export const getMessages = async(req,res)=>{
    try{

        const {id:otherUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId:myId,receiverId:otherUserId},
                {senderId:otherUserId,receiverId:myId}
            ]
        })

        if(messages.length==0){
            return res.status(400).json({
                error:true,
                message:"No Messages foundd"
            })
        }

        return res.status(200).json({
            error:false,
            data:messages
        })

    }catch(error){
        console.log("Error in getMessages controller",error);
        return res.status(500).json({
            error:true,
            message:"Internal server error"
        })
    }
}

export const sendMessage = async(req,res)=>{
    try{
        const {text='',image=''}=req.body;
        const {id:receiver}=req.params;
        const sender = req.user._id;

        let imageURL ;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageURL=uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId:sender,
            receiverId:receiver,
            text,
            image:imageURL
        })

        await newMessage.save();

        // realtime chat function
        return res.status(200).json({
            error:false,
            message:"Message sent successfully"
        })
    }catch(error){
        console.log("Error sendMessage in controller",error);
        return res.status(500).json({error:true,message:"Internal server error"})
    }
}