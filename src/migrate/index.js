const { knex } = require("../database");
const logger = require("../lib/logger");

const { name: TASK_NAME } = require("./package");
const log = logger.child({ task: TASK_NAME });

async function main() {
  const start = process.hrtime();
  log.info("start");

  // perform the migration
  const oldVersion = await knex.migrate.currentVersion();
  log.info(`current database migration version: ${oldVersion}`);
  await knex.migrate.latest();
  const newVersion = await knex.migrate.currentVersion();
  log.info(`new database migration version: ${newVersion}`);

  // clean up
  await knex.destroy();

  // log duration
  const [endSecs, endNanos] = process.hrtime(start);
  const duration = endNanos[0] / 1e9 + endSecs[1];
  log.info({ duration }, "complete");
}

// call main() if this file is the entry script
if (require.main === module) {
  main().catch(error => {
    log.error(error);
    process.exit(1);
  });
}
