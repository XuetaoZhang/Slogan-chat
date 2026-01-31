import axios from "axios";
import MessageSchema from "../src/schemas/messageSchema.js";
import RoomSchema from "../src/schemas/roomSchema.js";
import UserSchema from "../src/schemas/userSchema.js";

// 配置机器人信息
// 注意：以后如果换回 SpoonAI，只需要修改 apiUrl 和 model，以及解析返回值的逻辑
const BOT_CONFIG = {
  triggerPrefix: "@", 
  botUsername: "SentryNode-AI", // 机器人的用户名
  // 请在 .env 文件中配置 DEEPSEEK_API_KEY
  apiKey: process.env.DEEPSEEK_API_KEY, 
  // DeepSeek API 地址 (OpenAI 兼容接口)
  // 可以在 .env 中通过 DEEPSEEK_API_URL 覆盖
  apiUrl: process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions",
  // 使用的模型: deepseek-chat (V3) 或 deepseek-reasoner (R1)
  model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
  // 是否开启流式输出 (默认开启，如果 provider 不支持流式，可设为 false)
  enableStream: process.env.AI_ENABLE_STREAM !== 'false', 
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
    // 触发条件：消息中包含 @机器人名字 (不再强制要求开头)
    const trigger = `${BOT_CONFIG.triggerPrefix}${BOT_CONFIG.botUsername}`;
    if (!messageContent || !messageContent.includes(trigger)) {
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

    // 4. 先创建一个空的或者 "正在思考..." 的消息
    // 注意：内容不能完全为空，否则可能前端渲染有问题，用一个空格占位
    const msgData = {
      sender: botUserId,
      message: " ", 
      roomID,
      seen: [],
      createdAt: Date.now(),
      status: "sent",
    };

    const newMsg = await MessageSchema.create(msgData);

    // 5. 填充发送者信息 (头像、名字等)
    const populatedMsg = await MessageSchema.findById(newMsg._id)
      .populate("sender", "name username avatar _id")
      .lean();

    // 6. 通过 Socket 广播初始消息给房间内所有人
    io.to(roomID).emit("newMessage", {
        ...populatedMsg,
        replayedTo: null
    });

    // 更新房间最后一条消息预览 (显示正在思考...)
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

    // 7. 调用 AI API 获取回复 (流式或非流式)
    let currentMessage = "";
    let lastEmitTime = 0;

    // 定义流式回调
    const onChunk = (chunk) => {
        currentMessage += chunk;
        const now = Date.now();
        // 每 100ms 至少更新一次前端，避免过于频繁的 Socket 消息
        if (now - lastEmitTime > 100) {
             io.to(roomID).emit("streamMessage", {
                msgID: newMsg._id,
                streamedMsg: currentMessage
            });
            lastEmitTime = now;
        }
    };

    // 如果未开启流式，callDeepSeekAI 会忽略 onChunk，直接返回完整结果
    // 如果开启了流式，callDeepSeekAI 会调用 onChunk，并最终返回完整结果
    const fullResponse = await callDeepSeekAI(prompt, BOT_CONFIG.enableStream ? onChunk : null);

    // 8. 最终更新
    // 确保前端显示完整内容
    io.to(roomID).emit("streamMessage", {
        msgID: newMsg._id,
        streamedMsg: fullResponse
    });

    // 更新数据库中的最终消息内容
    await MessageSchema.findByIdAndUpdate(newMsg._id, { message: fullResponse });

    // 更新最后一条消息预览为最终内容
    const finalMsg = { ...populatedMsg, message: fullResponse };
    io.to(roomID).emit("lastMsgUpdate", finalMsg);
    io.to(roomID).emit("updateLastMsgData", {
      msgData: finalMsg,
      roomID,
    });

  } catch (error) {
    console.error("Error in handleSpoonAIBot:", error);
  }
};

/**
 * 调用 DeepSeek API (支持流式)
 * @param {string} prompt 
 * @param {function} onChunk - 接收流式片段的回调函数 (chunk) => void
 * @returns {Promise<string>} 完整的回复内容
 */
async function callDeepSeekAI(prompt, onChunk = null) {
  if (!BOT_CONFIG.apiKey) {
    return "配置错误：未找到 DEEPSEEK_API_KEY 环境变量。请在服务器 .env 文件中添加。";
  }

  try {
    const isStreaming = BOT_CONFIG.enableStream && typeof onChunk === 'function';

    const response = await axios.post(
      BOT_CONFIG.apiUrl,
      {
        model: BOT_CONFIG.model,
        messages: [
          { role: "system", content: "你是一个乐于助人的群聊机器人助手。" },
          { role: "user", content: prompt }
        ],
        stream: isStreaming
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${BOT_CONFIG.apiKey}`
        },
        timeout: 60000, // 60秒超时
        responseType: isStreaming ? 'stream' : 'json'
      }
    );

    if (!isStreaming) {
      // 非流式处理 (兼容旧逻辑)
      const content = response.data?.choices?.[0]?.message?.content;
      return content || "（机器人似乎在思考，但没有说话）";
    }

    // 流式处理
    let fullContent = "";
    const stream = response.data;
    
    // 简单判断 stream 是否是可读流
    if (!stream.on) {
        // 自动降级：如果服务器忽略了 stream: true 返回了 JSON 对象
        if (stream.choices) {
             const content = stream.choices?.[0]?.message?.content;
             return content || "（机器人似乎在思考，但没有说话）";
        }
        return "（无法解析的响应格式）";
    }

    let buffer = ""; // 用于缓存不完整的行
    
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            // 数组最后一个元素是不完整的行（如果没有换行符，则是整个 buffer），保留在 buffer 中等待下一次 chunk
            buffer = lines.pop(); 

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;
                if (trimmedLine === 'data: [DONE]') continue;
                
                if (line.startsWith('data: ')) {
                    try {
                        const jsonStr = line.replace('data: ', '');
                        const json = JSON.parse(jsonStr);
                        const content = json.choices?.[0]?.delta?.content || "";
                        if (content) {
                            fullContent += content;
                            if (onChunk) onChunk(content);
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
        });

        stream.on('end', () => {
            // 处理剩余的 buffer (通常 SSE 会以换行结束，buffer 应该为空，但以防万一)
            if (buffer && buffer.trim().startsWith('data: ')) {
                 try {
                    const jsonStr = buffer.replace('data: ', '');
                    const json = JSON.parse(jsonStr);
                    const content = json.choices?.[0]?.delta?.content || "";
                    if (content) {
                        fullContent += content;
                        if (onChunk) onChunk(content);
                    }
                } catch (e) {}
            }

            if (!fullContent) fullContent = "（机器人似乎在思考，但没有说话）";
            resolve(fullContent);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });

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
