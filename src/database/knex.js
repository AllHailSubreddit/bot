const { DB_URL } = process.env;
const { knexSnakeCaseMappers } = require("objection");
const path = require("path");

module.exports = require("knex")({
  client: "postgresql",
  connection: DB_URL,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: path.resolve(__dirname, "migrations"),
  },
  useNullAsDefault: true,
  ...knexSnakeCaseMappers(),
});
