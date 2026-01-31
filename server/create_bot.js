import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import UserSchema from "../src/schemas/userSchema.js";
import { fileURLToPath } from 'url';

const BOT_USERNAME = "Slogan-AI";
const BOT_NAME = "Slogan-AI";
// Use a fake phone number that won't conflict with real users
const BOT_PHONE = "0000000000"; 
const BOT_AVATAR = "/slogan-ai.png"; // User needs to place this file in public/

export const createBot = async (shouldConnect = true) => {
  try {
    if (shouldConnect) {
        if (!process.env.MONGODB_URI) {
          console.error("❌ Error: MONGODB_URI is not defined in .env file");
          return;
        }

        console.log("🔗 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected.");
    }

    // Check if new bot exists
    let bot = await UserSchema.findOne({ username: BOT_USERNAME });
    
    if (bot) {
       console.log(`✅ Bot user '${BOT_USERNAME}' already exists. Updating info...`);
       bot.name = BOT_NAME;
       bot.lastName = "";
       bot.avatar = BOT_AVATAR;
       await bot.save();
       console.log(`🎉 Bot updated successfully!`);
     } else {
         // Check if old bot "Sla" exists to rename it
         const oldBot = await UserSchema.findOne({ username: "Sla" });
         if (oldBot) {
             console.log(`🔄 Renaming old bot 'Sla' to '${BOT_USERNAME}'...`);
             oldBot.username = BOT_USERNAME;
             oldBot.name = BOT_NAME;
             oldBot.lastName = "";
             oldBot.avatar = BOT_AVATAR;
             await oldBot.save();
             bot = oldBot;
             console.log(`🎉 Bot renamed and updated successfully!`);
        } else {
            console.log(`🤖 Creating bot user '${BOT_USERNAME}'...`);

            // Generate a random password (no one needs to know it)
            const randomPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            bot = await UserSchema.create({
              name: BOT_NAME,
              lastName: "",
              username: BOT_USERNAME,
              phone: BOT_PHONE,
              password: hashedPassword,
              biography: "I am an AI assistant powered by DeepSeek.",
              avatar: BOT_AVATAR, 
              status: "online"
            });
            console.log(`🎉 Bot created successfully!`);
        }
    }
    
    console.log(`ID: ${bot._id}`);
    console.log(`Username: ${bot.username}`);
    
  } catch (error) {
    console.error("❌ Error creating/updating bot:", error);
  }
};

// Check if running directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    createBot(true).then(() => process.exit(0));
}
