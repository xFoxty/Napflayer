const { getDB } = require("./db.js");
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
`;
const { createBot } = require("./manager.js");
async function handle(ws, data) {
  const { qqNumber, msg } = data;

  // 辅助发送函数
  const send = (content) =>
    ws.send(
      JSON.stringify({
        action: "send_msg",
        params: { type: "private", user_id: qqNumber, message: content },
      })
    );

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
      case "#join": {
        // 连接服务器
        try {
          await join(qqNumber, send);
          send("成功连接到 Minecraft 服务器");
        } catch (e) {}
        break;
      }
      case "#leave": {
        // 断开连接
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
        const parts = msg.split(" ");
        if (parts.length !== 2) {
          send("未知指令，请发送 #help 查看帮助");
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
async function getUsers() {
  const db = await getDB();
  db.data ||= { users: [] };
  db.data.users ||= [];
  return { db, users: db.data.users };
}
async function editConfig(number, key, value) {
  const { db, users } = await getUsers();
  const user = users.find((u) => u.qq === number);
  if (user) {
    user[key] = value;
    await db.write();
    return { success: true };
  }
  throw { success: false, message: "用户不存在" };
}
async function init(number) {
  const { db, users } = await getUsers();

  if (users.some((u) => u.qq === number)) {
    return { success: false, message: "配置已经存在" };
  }

  users.push({ qq: number, createdAt: Date.now() });
  await db.write();
  return { success: true };
}

async function clear(number) {
  const { db, users } = await getUsers();
  const index = users.findIndex((u) => u.qq === number);

  if (index === -1) {
    return { success: false, message: "配置不存在" };
  }

  users.splice(index, 1);
  await db.write();
  return { success: true };
}

async function config(number) {
  const { users } = await getUsers();
  const user = users.find((u) => u.qq === number);

  if (!user) {
    return { success: false, message: "配置不存在" };
  }
  return { success: true, data: user };
}
async function join(number, msgFn) {
  const cc = await config(number);
  const bot = await createBot(cc.data, msgFn);
  return bot;
}
module.exports = { handle };
