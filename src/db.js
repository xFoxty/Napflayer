const path = require("path");
const DEFAULT_CONFIG = { users: [] };

let db = null;

async function initDB() {
  if (!db) {
    const db_path = path.join(__dirname, "../db/config.json");
    const { JSONFilePreset } = await import("lowdb/node");
    db = await JSONFilePreset(db_path, DEFAULT_CONFIG);
  }
  await db.write()
  return db;
}
async function getDB() {
  if (!db) throw new Error("db 未初始化");
  return db;
}
module.exports = { initDB, getDB };
