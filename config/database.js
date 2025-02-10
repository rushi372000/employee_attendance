import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    // console.log(
    //   `Connected successfully with mongodb ${conn.connection.host}`.bgMagenta
    //     .white
    // );
  } catch (error) {
    // console.log(`Error in MongoDB. ${error}`.bgRed.white);
  }
};

export default connectDB;
