const mineflayer = require("mineflayer");

// 存储机器人实例
const bots = new Map();

/**
 * 异步创建机器人
 * @param {Object} config 配置信息
 * @param {Function} msgFn QQ 消息发送回调
 */
async function createBot(config, msgFn) {
    const { config: getConfig } = require("./store.js");
    const { server, port, version, email, qq: qqNumber } = config;

    return new Promise((resolve, reject) => {
        console.log(`正在为 QQ:${qqNumber} 初始化机器人...`);

        const bot = mineflayer.createBot({
            host: server,
            port: port || 25565,
            version: version,
            auth: "microsoft",
            username: email,
            onMsaCode: (data) => {
                console.log("收到微软验证数据:", data);
                msgFn(`🔐 [微软验证]\n${data.message}`);
            },
        });

        bot.once("login", () => {
            console.log(`${email} 登录成功!`);
            bots.set(qqNumber, bot);
            msgFn(`✅ 机器人 [${bot.username}] 已成功进入服务器！`);
            resolve(bot); // 只有登录成功了，await 才会结束
        });

        bot.once("error", (err) => {
            console.error("连接出错:", err);
            msgFn(`❌ 连接出错: ${err.message}`);
            reject(err);
        });
        bot.on("message", async (jsonMsg) => {
            const user = await getConfig(qqNumber);
            if (!user.data?.chat) return;
            const fullText = jsonMsg.toString();
            let sender = "系统";
            let content = fullText;
            try {
                // @ts-ignore
                const unsignedData = jsonMsg.unsigned?.json;
                if (unsignedData && unsignedData.with && unsignedData.with[0].extra) {
                    const extra = unsignedData.with[0].extra;
                    if (extra[0] && extra[0].extra && extra[0].extra[0]) {
                        sender = extra[0].extra[0].text;
                    }
                    if (extra[2]) {
                        content = extra[2].text || extra[2][""];
                    }
                }
            } catch (e) {
                console.log("解析 JSON 失败");
            }
            if (sender === bot.username) return;
            msgFn(`[${sender}] ${content}`);
        });
        bot.on("end", (reason) => {
            console.log(`机器人断开连接: ${reason}`);
            bots.delete(qqNumber);
            msgFn(`⚠️ 机器人已掉线: ${reason}`);
        });
    });
}

module.exports = { createBot, getBot: (qq) => bots.get(qq) };
