require('dotenv').config()
console.log(process);

const WebSocket = require("ws");
const { initDB } = require("./db.js");
if (!process.env.WS_URL) {
  console.error("请在环境变量中设置 WS_URL");
  process.exit(1);
}
const ws = new WebSocket(process.env.WS_URL);

async function run() {
  await initDB();
  let ping = null;
  ws.on("open", () => {
    console.log("连接成功");
    ping = setInterval(() => {
      // 保持心跳
      // ws.send(JSON.stringify({ type: "heartbeat" }));
    }, 30000);
  });
  ws.on("error", (err) => {
    console.log("连接错误", err);
    clearInterval(ping);
    ping = null;
  });
  ws.on("close", () => {
    console.log("连接关闭");
    clearInterval(ping);
    ping = null;
  });
  const { handle } = require("./commands.js");
  ws.on("message", (data) => {
    const event = JSON.parse(data.toString());
    if (
      event.message_type === "private" &&
      event.sub_type === "friend" &&
      event.message.length === 1 &&
      event.raw_message.startsWith("#")
    ) {
      const result = {
        qqNumber: event.user_id,
        msg: event.raw_message,
      };
      handle(ws, result);
    }
  });
}
run();
