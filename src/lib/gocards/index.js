const crypto = require("crypto");
const xml = require("fast-xml-parser");
const he = require("he");
const moment = require("moment-timezone");
const fetch = require("node-fetch");

const xmlOptions = {
  ignoreAttributes: true,
  ignoreNameSpace: true,
  tagValueProcessor: value => he.decode(value),
  trimValues: true,
};
const gameDetailsRegexp = /^(?:cancelled|\[[lntw]])?\s*university\s+of\s+louisville\s+(?<team>(?:(?<sex>men|women)'s\s+)?(?<sport>.+?))\s+(?<venue>vs|at)?\s+(?<opponent>.+)$/i;
const gameResultsRegexp = /^(?<result>[lntw])\s+(?:-|(?<scoreA>\d+)-(?<scoreB>\d+)(?:\s+\(\d+\))?|-\s+(?<wins>\d+)\s+wins|-\s+(?<placeTied>t-)?(?<place>\d+)[dnhrst]{2}?\s+of\s+(?<totalPlaces>\d+)\s+teams)$/i;
const gameExtrasRegexp = /^(?<key>.+):\s+(?<value>.+)$/i;
const teamIdMap = {
  baseball: 1,
  "field hockey": 2,
  football: 3,
  "men's basketball": 5,
  "men's cross country": 6,
  "men's golf": 7,
  "men's soccer": 8,
  "swimming & diving": 9,
  "swimming and diving": 9,
  "men's tennis": 10,
  "men's track & field": 11,
  "men's track and field": 11,
  softball: 12,
  "women's basketball": 13,
  "women's cross country": 14,
  "women's golf": 15,
  "women's lacrosse": 16,
  rowing: 17,
  "women's soccer": 18,
  "women's swimming & diving": 19,
  "women's swimming and diving": 19,
  "women's tennis": 20,
  "women's track & field": 21,
  "women's track and field": 21,
  "women's volleyball": 22,
  "cross country": 27,
  "track & field": 28,
  "track and field": 28,
};

async function getCalendarForSport(id) {
  const response = await fetch(
    `https://gocards.com/calendar.ashx/calendar.rss?sport_id=${id}`
  );
  const body = await response.text();
  const json = xml.parse(body, xmlOptions);
  const events = json.rss.channel.item.map(format).filter(Boolean);
  return { events };
}

async function getCalendarForAllSports() {
  return getCalendarForSport(0);
}

function format(item) {
  try {
    // hash the item for later comparison
    const hasher = crypto.createHash("md5");
    hasher.update(JSON.stringify(item));
    const hash = hasher.digest("hex");

    // parse the description for information about the game
    const desc = parseDescription(item.description);

    // check for required fields
    if (
      !item.gameid ||
      !item.startdate ||
      !item.enddate ||
      !desc.team ||
      !desc.sport ||
      !desc.opponent ||
      (!desc.scoreA && desc.scoreB) ||
      (desc.scoreA && !desc.scoreB) ||
      (!desc.place && desc.totalPlaces) ||
      (desc.place && !desc.totalPlaces)
    ) {
      return null;
    }

    let team = desc.team.trim();
    let teamId = teamIdMap[team.toLowerCase()];
    if (!teamId) {
      return null;
    }

    let location = null;
    if (item.location) {
      // LOUISVILLE is always in all caps, so just capitalize the first letter
      location = item.location.replace("LOUISVILLE", "Louisville").trim();
    }

    let isHome = false;
    if (desc.venue && desc.venue.toLowerCase().trim() === "vs") {
      isHome = true;
    }

    let result = desc.result
      ? desc.result
          .toUpperCase()
          .trim()
          .slice(0, 1)
      : null;
    // account for multiple ways to score a game
    let scoreType = null;
    let scoreHome = null;
    let scoreAway = null;
    if (desc.scoreA) {
      scoreType = "points";
      scoreHome = isHome ? +desc.scoreA : +desc.scoreB;
      scoreAway = isHome ? +desc.scoreB : +desc.scoreA;
    } else if (desc.wins) {
      scoreType = "wins";
      scoreHome = +desc.wins;
    } else if (desc.place) {
      scoreType = "places";
      result = desc.placeTied ? "T" : result;
      scoreHome = +desc.place;
      scoreAway = +desc.totalPlaces;
    }

    return {
      id: +item.gameid,
      teamId,
      team,
      sport: desc.sport.trim(),
      sportSex: desc.sex ? desc.sex.trim() : null,
      opponent: desc.opponent.trim(),
      location,
      isHome,
      start: moment.utc(item.startdate).toISOString(),
      end: moment.utc(item.enddate).toISOString(),
      result: result ? result.toUpperCase() : null,
      scoreType,
      scoreHome,
      scoreAway,
      extras: desc.extras || {},
      url: item.link ? item.link.trim() : null,
      inputChecksum: hash,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

function parseDescription(description) {
  return description
    .split(/\n|\\n/g)
    .slice(0, -1)
    .map(line => line.trim())
    .filter(line => line.length)
    .reduce((o, line) => {
      if (gameDetailsRegexp.test(line)) {
        const { groups } = gameDetailsRegexp.exec(line);
        return { ...o, ...groups };
      } else if (gameResultsRegexp.test(line)) {
        const { groups } = gameResultsRegexp.exec(line);
        return { ...o, ...groups };
      } else if (gameExtrasRegexp.test(line)) {
        const {
          groups: { key, value },
        } = gameExtrasRegexp.exec(line);
        return {
          ...o,
          extras: {
            ...(o.extras || {}),
            [key.toLowerCase().trim()]: value,
          },
        };
      }

      return o;
    }, {});
}

module.exports = {
  getCalendarForSport,
  getCalendarForAllSports,
};
