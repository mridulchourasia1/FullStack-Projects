import mongoose from "mongoose";

const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/web1";

export function connectDB() {
  return mongoose.connect(mongoURI)
    .then(() => {
      console.log("Successful connect to MongoDB Atlas or local MongoDB");
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
    });
}
