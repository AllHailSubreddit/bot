const moment = require("moment-timezone");
const { Model } = require("objection");

class BaseModel extends Model {
  $parseDatabaseJson(json) {
    const parsed = super.$parseDatabaseJson(json);

    // parse common timestamps as moment objects
    ["createdAt", "updatedAt"].forEach(prop => {
      if (json[prop]) {
        parsed[prop] = moment.utc(json[prop]);
      }
    });

    return parsed;
  }

  $formatDatabaseJson(json) {
    const formatted = super.$formatDatabaseJson(json);

    // format common moment objects as timestamps
    ["createdAt", "updatedAt"].forEach(prop => {
      if (json[prop] && moment.isMoment(json[prop])) {
        formatted[prop] = json[prop].toISOString();
      }
    });

    return formatted;
  }

  static get useLimitInFirst() {
    return true;
  }

  static sqlValues(array) {
    const values = Array(...array)
      .map(params => params.map(() => "?").join(","))
      .map(params => `(${params})`)
      .join(",");
    return `values ${values}`;
  }
}

module.exports = BaseModel;
