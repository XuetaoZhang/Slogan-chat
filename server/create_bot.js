import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import UserSchema from "../src/schemas/userSchema.js";

const BOT_USERNAME = "Sla";
const BOT_NAME = "Spoon AI";
// Use a fake phone number that won't conflict with real users
const BOT_PHONE = "0000000000"; 

const createBot = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ Error: MONGODB_URI is not defined in .env file");
      process.exit(1);
    }

    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected.");

    // Check if bot exists
    const existingBot = await UserSchema.findOne({ username: BOT_USERNAME });
    if (existingBot) {
      console.log(`✅ Bot user '${BOT_USERNAME}' already exists. ID: ${existingBot._id}`);
      process.exit(0);
    }

    console.log(`🤖 Creating bot user '${BOT_USERNAME}'...`);

    // Generate a random password (no one needs to know it)
    const randomPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    const newBot = await UserSchema.create({
      name: BOT_NAME,
      username: BOT_USERNAME,
      phone: BOT_PHONE,
      password: hashedPassword,
      biography: "I am an AI assistant powered by DeepSeek.",
      avatar: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png", // Generic robot icon
      status: "online"
    });

    console.log(`🎉 Bot created successfully!`);
    console.log(`ID: ${newBot._id}`);
    console.log(`Username: ${newBot.username}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating bot:", error);
    process.exit(1);
  }
};

createBot();
