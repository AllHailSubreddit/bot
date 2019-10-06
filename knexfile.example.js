module.exports = {
  client: "postgresql",
  connection: "",
  migrations: {
    tableName: "knex_migrations",
    directory: "src/database/migrations",
  },
};
