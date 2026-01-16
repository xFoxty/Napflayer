const { createBot } = require("./manager.js");
const { getDB } = require("./db.js");
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
const { getBot } = require("./manager.js");
async function chat(number, message) {
  const bot = getBot(number);
  if (bot) {
    bot.chat(message);
    return { success: true };
  }
  return { success: false, message: "机器人未连接" };
}
async function leave(number) {
  const bot = getBot(number);
  if (bot) {
    bot.quit("用户请求断开连接");
    return { success: true };
  }
  return { success: false, message: "机器人未连接" };
}
async function status(number) {
  const bot = getBot(number);
  // 获取状态并返回
  if (!bot) {
    return {
      success: false,
      message: "机器人状态错误",
    };
  }
  const health = bot.health;
  const food = bot.food;
  return {
    success: true,
    message: `
    血量: ${health}
    饱食度: ${food}
  `,
  };
}
module.exports = {
  init,
  join,
  chat,
  status,
  leave,
  getBot,
  getUsers,
  config,
  clear,
  editConfig,
};
