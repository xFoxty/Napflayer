//消息缓存
const messageBuffers = new Map();
const helpMessage = `支持的命令有：
#help - 查看帮助
#clear - 清理配置
#init - 初始化配置
#config - 查看状态
#email <邮箱地址> - 设置邮箱地址
#server <服务器地址> - 设置服务器地址
#port <端口号> - 设置服务器端口 默认 25565
#version <游戏版本> - 设置游戏版本 例如 1.20.4 默认 1.21.8
#join - 连接服务器
#leave - 断开连接
#chat-on - 开启聊天转发
#chat-off - 关闭聊天转发
~<消息内容> - 发送聊天消息
`;
const {
  init,
  status,
  config,
  clear,
  chat,
  leave,
  join,
  editConfig,
} = require("./store.js");

function sendOptimized(qqNumber, ws, content) {
  if (!messageBuffers.has(qqNumber)) {
    messageBuffers.set(qqNumber, {
      messages: [],
      timer: null,
    });
  }

  const buffer = messageBuffers.get(qqNumber);
  buffer.messages.push(content);
  if (!buffer.timer) {
    buffer.timer = setTimeout(() => {
      const finalMessage = buffer.messages.join("\n");
      if (ws.readyState === 1) {
        ws.send(
          JSON.stringify({
            action: "send_msg",
            params: {
              type: "private",
              user_id: qqNumber,
              message: finalMessage,
            },
          })
        );
      }
      messageBuffers.delete(qqNumber);
      console.log(
        `[Buffer] 已合并发送 ${buffer.messages.length} 条消息给 ${qqNumber}`
      );
    }, 1000);

  }
}
async function handle(ws, data) {
  const { qqNumber, msg } = data;
  const send = sendOptimized.bind(null, qqNumber, ws);
  try {
    switch (msg) {
      case "#init": {
        const res = await init(qqNumber);
        send(res.success ? "初始化配置完成" : res.message);
        break;
      }
      case "#clear": {
        const res = await clear(qqNumber);
        send(res.success ? "清理配置完成" : res.message);
        break;
      }
      case "#status":{
        const res = await status(qqNumber);
        send(res.message);
        break
      }
      case "#join": {
        // 连接服务器
        try {
          await join(qqNumber, send);
          send("成功连接到 Minecraft 服务器");
        } catch (e) {}
        break;
      }
      case "#leave": {
        const res = await leave(qqNumber);
        send(res.success ? "已断开连接" : res.message);
        break;
      }
      case "#chat-on": {
        const res = await editConfig(qqNumber, "chat", true);
        send(res.success ? "聊天转发已开启" : res.message);
        break;
      }
      case "#chat-off": {
        const res = await editConfig(qqNumber, "chat", false);
        send(res.success ? "聊天转发已关闭" : res.message);
        break;
      }
      case "#config": {
        const res = await config(qqNumber);
        send(res.success ? `${JSON.stringify(res.data)}` : res.message);
        break;
      }
      case "#help":
        send(helpMessage);
        break;
      default:
        if (msg.startsWith("~")) {
          const message = msg.substring(1);
          const res = await chat(qqNumber, message);
          if (!res.success) {
            send(res.message);
            break;
          }
          if (!res.success) {
            send(res.message);
          }
          break;
        }
        const parts = msg.split(" ");
        if (parts.length !== 2) {
          send("未知指令，请发送 #help 查看帮助");
          break;
        }
        if (msg.startsWith("#email")) {
          const emailAddress = parts[1];
          const res = await editConfig(qqNumber, "email", emailAddress);
          send(res.success ? "邮箱配置完成" : res.message);
          break;
        } else if (msg.startsWith("#server")) {
          const serverAddress = parts[1];
          const res = await editConfig(qqNumber, "server", serverAddress);
          send(res.success ? "服务器地址配置完成" : res.message);
          break;
        } else if (msg.startsWith("#version")) {
          const version = parts[1];
          const res = await editConfig(qqNumber, "version", version);
          send(res.success ? "游戏版本配置完成" : res.message);
          break;
        } else if (msg.startsWith("#port")) {
          const port = parseInt(parts[1], 10);
          if (isNaN(port)) {
            send("端口号必须是数字");
            break;
          }
          const res = await editConfig(qqNumber, "port", port);
          send(res.success ? "服务器端口配置完成" : res.message);
          break;
        }
        break;
    }
  } catch (e) {
    // 这里捕获的是真正的系统错误（比如数据库文件读写权限）
    console.error("处理指令出错:", e);
    send("服务器内部错误");
  }
}
module.exports = { handle };
