const BaseModel = require("./BaseModel");

class GoCardsGame extends BaseModel {
  static get tableName() {
    return "gocards_game";
  }

  static async insertOne(knex, event) {
    return GoCardsGame.query(knex).insert(event);
  }

  static async patchOneById(knex, id, event) {
    return GoCardsGame.query(knex)
      .findById(id)
      .patch(event);
  }

  static async getNewIdsFromValuesArray(knex, values) {
    const tableName = GoCardsGame.tableName;
    // format values as "(values (?), ...) as t(??)"
    const sqlValues = knex.raw(
      `(${GoCardsGame.sqlValues(values)}) as t(external_id)`,
      values.flat()
    );
    return GoCardsGame.query(knex)
      .select("t.external_id")
      .from(sqlValues)
      .leftJoin(tableName, `${tableName}.external_id`, "t.external_id")
      .whereNull(`${tableName}.external_id`)
      .map(result => result.externalId);
  }

  static async getIdsByNewChecksumsFromValuesArray(knex, values) {
    const tableName = GoCardsGame.tableName;
    // format values as "(values (?, ?), ...) as t(??, ??)"
    const sqlValues = knex.raw(
      `(${GoCardsGame.sqlValues(values)}) as t(external_id, input_checksum)`,
      values.flat()
    );
    return GoCardsGame.query(knex)
      .select(`${tableName}.id`, "t.external_id")
      .from(sqlValues)
      .innerJoin(tableName, `${tableName}.external_id`, "t.external_id")
      .where(`${tableName}.input_checksum`, "!=", knex.ref("t.input_checksum"));
  }
}

module.exports = GoCardsGame;
