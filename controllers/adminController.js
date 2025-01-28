
import validator from "validator"
import bcrypt from "bcrypt"
import {v2 as cloudinary} from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import jwt from "jsonwebtoken"

// API for adding doctor 

const addDoctor = async (req, res) => {
  try {
    const {name, email, password, speciality, degree, experience, about, fees, address} = req.body

    const imageFile = req.file



      //checking for all data to add doctor

      // if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      //   return res.json({success:false, message:"Missing details"})
      // }

      // validating email format 
      if (!validator.isEmail(email)) {
        return res.json({success:false, message:"Please enter a valid email"})
      }

      //validating strong password
      if (password.length < 8) {
        return res.json({success:false, message: "Please enter a valid password"})
        
      }

      // hashing doctor passwords
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // upload image to cloudinary

      // const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:"image"})
      // const imageUrl = imageUpload.secure_url

    //   try {
    //     // ... other code ...
    
    //     const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" }); 
    // } catch (imageUploadError) {
    //     console.error("Image upload failed:", imageUploadError);
    //     return res.status(500).json({ success: false, message: "Failed to upload doctor's image." });
        
      
    // }

    
        
       
      const doctorData = {
        name: name,
        email,
        // image:imageUrl,
        image: "",
        password: hashedPassword,
        speciality,
        degree,
        experience,
        about,
        fees,
        address:JSON.parse(address),
        date:Date.now(),

      }
      
      const newDoctor = new doctorModel(doctorData)
      await newDoctor.save()

      res.json({success:true, message:"Doctor Added"})

    
  } catch (error) {
    console.log(error)
    res.json({success:false, message:error.message})
  }
}

// API for admin login

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const payload = {
        email, // Add email to the payload
        role: "admin", // Optional: Add any additional claims to the token
      };

      // Generate the token
      const token = jwt.sign(payload, process.env.JWT_SECRET);

      // Send the token in the response
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
// API to get all doctors list for admin panel 
// const allDoctors = async (req, res) => {
//   try {

//     const doctors = await doctorModel.find().select("-password")
//     res.json({success:true , doctors})
//   } catch (error) {
//     console.log(error)
//     res.json({success:false, message:error.message})
//   }
  
// }


const allDoctors = async (req, res) => {
  try {
    // Fetch all doctors, excluding the password field
    const doctors = await doctorModel.find({}).select("-password");

    // Send the response
    res.json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.log("Error fetching doctors:", error);
    res.json({
      success: false,
      message: error.message,
    });
   
  }
  
};



export {addDoctor, loginAdmin, allDoctors}