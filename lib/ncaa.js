const axios = require("axios");
const client = axios.create({
  baseURL: "https://data.ncaa.com/casablanca",
  timeout: 2000,
});

const get = async path => client.get(path).then(response => response.data);

const game = async (sport, division, date) =>
  get(`/game/${sport}/${division}/${date}/gameInfo.json`);

const gameByPath = async path => get(`${path}/gameInfo.json`);

const scoreboard = async (sport, division, date) =>
  get(`/scoreboard/${sport}/${division}/${date}/scoreboard.json`);

const today = async (sport, division) =>
  get(`/schedule/${sport}/${division}/today.json`);

const todaysScoreboard = async (sport, division) =>
  today(sport, division).then(({ today }) =>
    scoreboard(sport, division, today)
  );

module.exports = {
  game,
  gameByPath,
  scoreboard,
  today,
  todaysScoreboard,
};
