import axios from "axios";
import MessageSchema from "../src/schemas/messageSchema.js";
import RoomSchema from "../src/schemas/roomSchema.js";
import UserSchema from "../src/schemas/userSchema.js";

// 配置机器人信息
// 注意：以后如果换回 SpoonAI，只需要修改 apiUrl 和 model，以及解析返回值的逻辑
const BOT_CONFIG = {
  triggerPrefix: "@", 
  botUsername: "Sla", // 机器人的用户名
  // 请在 .env 文件中配置 DEEPSEEK_API_KEY
  apiKey: process.env.DEEPSEEK_API_KEY, 
  // DeepSeek API 地址 (OpenAI 兼容接口)
  // 可以在 .env 中通过 DEEPSEEK_API_URL 覆盖
  apiUrl: process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions",
  // 使用的模型: deepseek-chat (V3) 或 deepseek-reasoner (R1)
  model: process.env.DEEPSEEK_MODEL || "deepseek-chat", 
};

/**
 * 处理机器人命令的主函数
 * @param {Object} params
 * @param {string} params.messageContent - 用户发送的消息内容
 * @param {string} params.roomID - 房间ID
 * @param {Object} params.io - Socket.io 实例
 * @param {string} params.senderId - 发送者ID
 */
export const handleSpoonAIBot = async ({ messageContent, roomID, io, senderId }) => {
  try {
    // 1. 检查是否触发机器人
    // 触发条件：以 @机器人名字 开头
    const trigger = `${BOT_CONFIG.triggerPrefix}${BOT_CONFIG.botUsername}`;
    if (!messageContent || !messageContent.trim().startsWith(trigger)) {
      return;
    }

    console.log(`[Bot] Triggered by message: ${messageContent}`);

    // 2. 提取 prompt (去掉触发词)
    const prompt = messageContent.replace(trigger, "").trim();
    if (!prompt) return;

    // 3. 查找机器人用户ID
    const botUser = await UserSchema.findOne({ username: BOT_CONFIG.botUsername });
    if (!botUser) {
        console.error(`[Bot] Error: User '${BOT_CONFIG.botUsername}' not found in database. Please run 'npm run create-bot' first.`);
        return;
    }
    const botUserId = botUser._id;

    // 防止机器人自己回复自己 (虽然逻辑上不会触发，但加个保险)
    if (senderId.toString() === botUserId.toString()) return;

    // 4. 调用 AI API 获取回复
    const botResponseText = await callDeepSeekAI(prompt);

    // 5. 创建并保存回复消息
    const msgData = {
      sender: botUserId,
      message: botResponseText,
      roomID,
      seen: [],
      createdAt: Date.now(),
      status: "sent",
    };

    const newMsg = await MessageSchema.create(msgData);

    // 6. 填充发送者信息 (头像、名字等)
    const populatedMsg = await MessageSchema.findById(newMsg._id)
      .populate("sender", "name username avatar _id")
      .lean();

    // 7. 通过 Socket 广播给房间内所有人
    io.to(roomID).emit("newMessage", {
        ...populatedMsg,
        replayedTo: null
    });

    // 更新房间最后一条消息预览
    io.to(roomID).emit("lastMsgUpdate", populatedMsg);
    io.to(roomID).emit("updateLastMsgData", {
      msgData: populatedMsg,
      roomID,
    });

    // 更新房间的消息列表引用
    await RoomSchema.findOneAndUpdate(
      { _id: roomID },
      { $push: { messages: newMsg._id } }
    );

  } catch (error) {
    console.error("Error in handleSpoonAIBot:", error);
  }
};

/**
 * 调用 DeepSeek API
 * @param {string} prompt 
 * @returns {Promise<string>}
 */
async function callDeepSeekAI(prompt) {
  if (!BOT_CONFIG.apiKey) {
    return "配置错误：未找到 DEEPSEEK_API_KEY 环境变量。请在服务器 .env 文件中添加。";
  }

  try {
    const response = await axios.post(
      BOT_CONFIG.apiUrl,
      {
        model: BOT_CONFIG.model,
        messages: [
          { role: "system", content: "你是一个乐于助人的群聊机器人助手。" },
          { role: "user", content: prompt }
        ],
        stream: false
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${BOT_CONFIG.apiKey}`
        },
        timeout: 60000 // 60秒超时
      }
    );

    // 解析 OpenAI 兼容格式的响应
    const content = response.data?.choices?.[0]?.message?.content;
    return content || "（机器人似乎在思考，但没有说话）";

  } catch (error) {
    console.error("DeepSeek API call failed:", error?.response?.data || error.message);
    if (error?.response?.status === 401) {
        return "API 认证失败，请检查 Key 是否正确。";
    }
    if (error?.response?.status === 402) {
        return "余额不足，请检查 DeepSeek 账户余额。";
    }
    return "抱歉，我现在连接大脑有点困难，请稍后再试。";
  }
}
