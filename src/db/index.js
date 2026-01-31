import { config } from "dotenv";
config();
import mongoose from "mongoose";

let isConnected = false;
let isReconnecting = false;

const connectToDB = async () => {
  if (isConnected) {
    console.log("✅ Already connected to MongoDB");
    return;
  }

  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    isReconnecting = false;
    console.log("✅ Connected to MongoDB successfully");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);

    if (!isReconnecting) {
      isReconnecting = true;
      console.log("🔄 Retrying connection in 5 seconds...");
      setTimeout(connectToDB, 5000);
    }
  }
};

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
  isConnected = false;
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected. Attempting to reconnect...");
  if (!isReconnecting) {
    isReconnecting = true;
    connectToDB();
  }
});

export default connectToDB;
