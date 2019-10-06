const { LOG_LEVEL } = process.env;
const pino = require("pino");

module.exports = pino({
  level: LOG_LEVEL,
  name: "allhailbot",
});
