import axios from "axios";
import MessageSchema from "../src/schemas/messageSchema.js";
import RoomSchema from "../src/schemas/roomSchema.js";
import UserSchema from "../src/schemas/userSchema.js";

// 配置机器人信息
const BOT_CONFIG = {
  triggerPrefix: "@", 
  botUsername: "SentryNode-AI", // 机器人的用户名
  // 新的 AI 接口地址
  apiUrl: "https://95f712f.r8.cpolar.cn/api/v1/chat",
  // 是否开启流式输出
  enableStream: true, 
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

    const fullResponse = await callSentryNodeAI(prompt, BOT_CONFIG.enableStream ? onChunk : null);

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
 * 调用新的 SentryNode AI API (支持流式)
 * @param {string} prompt 
 * @param {function} onChunk - 接收流式片段的回调函数 (chunk) => void
 * @returns {Promise<string>} 完整的回复内容
 */
async function callSentryNodeAI(prompt, onChunk = null) {
  try {
    const isStreaming = BOT_CONFIG.enableStream && typeof onChunk === 'function';

    const response = await axios.post(
      BOT_CONFIG.apiUrl,
      {
        message: prompt,
        is_vip: false,
        stream: isStreaming
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream", // 明确告诉服务器/代理我们期望流式数据
          "Cache-Control": "no-cache",   // 防止代理缓存
          "Connection": "keep-alive",    // 保持连接
          "X-Accel-Buffering": "no"      // 尝试禁用 Nginx 缓冲 (如果对方使用了 Nginx)
        },
        timeout: 60000, // 60秒超时
        responseType: isStreaming ? 'stream' : 'json'
      }
    );

    // 非流式处理
    if (!isStreaming) {
      if (response.data && response.data.status === 'success') {
          return response.data.answer || "（机器人似乎在思考，但没有说话）";
      } else {
          console.error("AI API Error Response:", response.data);
          return "（机器人响应异常）";
      }
    }

    // 流式处理
    let fullContent = "";
    const stream = response.data;
    let buffer = ""; // 用于缓存不完整的行

    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => {
            buffer += chunk.toString();
            
            // 处理 buffer 中的每一行
            let lineEndIndex;
            while ((lineEndIndex = buffer.indexOf('\n')) !== -1) {
                const line = buffer.slice(0, lineEndIndex).trim();
                buffer = buffer.slice(lineEndIndex + 1);
                
                if (!line) continue;
                
                let content = "";
                // 尝试解析 SSE 格式 "data: {...}"
                if (line.startsWith('data: ')) {
                    const jsonStr = line.replace('data: ', '');
                    if (jsonStr === '[DONE]') continue;
                    try {
                        const json = JSON.parse(jsonStr);
                        content = json.answer || json.content || ""; 
                    } catch (e) {}
                } 
                // 尝试直接解析 JSON 行 "{...}"
                else if (line.startsWith('{') && line.endsWith('}')) {
                    try {
                        const json = JSON.parse(line);
                        content = json.answer || json.content || "";
                    } catch (e) {}
                }
                
                if (content) {
                    fullContent += content;
                    if (onChunk) onChunk(content);
                }
            }
        });

        stream.on('end', () => {
            // 处理剩余的 buffer
            if (buffer.trim()) {
                const line = buffer.trim();
                let content = "";
                if (line.startsWith('data: ')) {
                    try {
                         const json = JSON.parse(line.replace('data: ', ''));
                         content = json.answer || json.content || "";
                    } catch(e) {}
                } else if (line.startsWith('{')) {
                    try {
                        const json = JSON.parse(line);
                        content = json.answer || json.content || "";
                    } catch(e) {}
                }
                if (content) {
                    fullContent += content;
                    if (onChunk) onChunk(content);
                }
            }

            if (!fullContent) fullContent = "（机器人似乎在思考，但没有说话）";
            resolve(fullContent);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });

  } catch (error) {
    console.error("AI API call failed:", error?.response?.data || error.message);
    return "抱歉，我现在连接大脑有点困难，请稍后再试。";
  }
}
