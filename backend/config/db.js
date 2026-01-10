import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDb = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log("Database connected successfully")
    }
    catch (err) {
        console.log("Connection failed " + err);
        process.exit(1);
    }
}