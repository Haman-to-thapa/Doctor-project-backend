import mongoose from "mongoose";


const connectDB = async () => {

  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB successfully!');
  });
  
}

export default connectDB