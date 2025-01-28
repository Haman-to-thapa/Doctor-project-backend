import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from "cloudinary"

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Request body:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing details" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid email" });
    }

    // Check if email already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Enter a strong password (minimum 8 characters)" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to the database
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// API for user login
const loginUser = async (req,res) => {
  try {
    const {email, password} = req.body
    const user = await userModel.findOne({email})

    if (!user) {
     return res.json({success:false, message:"user does not exist"})
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if (isMatch) {
      const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
      res.json({success:true, token})
    } else {
      res.json({success:false, message:"Invalid credentials"} )
    }
    
  } catch (error) {
    console.log(error)
    req.json({success:true, message:error.message})
  }
}

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    
    const {userId} = req.body
    const userData = await userModel.findById(userId).select('-password')

    res.json({success:true, userData})

  } catch (error) {
    console.log(error)
    res.json({success:false, message:error.message})
  }
}


// API to update user profile 
const updateProfile = async (req, res) => {
  try {
      const {userId, name , phone , address, dob, gender} = req.body
      const imageFile = req.file

      if (!name || !phone || !dob || !gender) {
        return res.json({success:false, message:"Data Missing"})
      }
         
      await userModel.findByIdAndUpdate(userId, {name, phone, address: JSON.parse(address), dob, gender})

      if (imageFile) {
        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type:'image'})
        const imageURL = imageUpload.secure_url

        await userModel.findByIdAndUpdate(userId,{image:imageURL})
      }

      res.json({success:true, message:"profile Update"})

  } catch (error) {
    console.log(error)
    res.json({success:ture, message:error.message})
  }
}

export { registerUser , loginUser, getProfile, updateProfile};
