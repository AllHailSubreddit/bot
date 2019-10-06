const { knex } = require("../database");
const { GoCardsGame } = require("../database/models");
const { getCalendarForAllSports } = require("../lib/gocards");
const logger = require("../lib/logger");

const { name: TASK_NAME } = require("./package");

const log = logger.child({ task: TASK_NAME });

async function main() {
  const start = process.hrtime();
  log.info("start");

  log.debug("retrieving calendar events");
  const calendar = await getCalendarForAllSports();
  const events = calendar.events;
  log.debug({ total: events.length }, "calendar events retrieved");

  await insertEvents(events);
  await updateEvents(events);

  // clean up
  await knex.destroy();

  // log duration
  const [endSecs, endNanos] = process.hrtime(start);
  const duration = endNanos[0] / 1e9 + endSecs[1];
  log.info({ duration }, "complete");
}

async function insertEvents(events) {
  // determine which event IDs can be inserted into the database
  const values = events.map(event => [event.id.toString()]);
  const idsToInsert = await GoCardsGame.getNewIdsFromValuesArray(knex, values);

  if (!idsToInsert || !idsToInsert.length) {
    log.info({ total: 0 }, "no insertable events");
    return;
  }

  // map the insertable IDs to event data
  const eventsToInsert = idsToInsert
    .map(id => events.find(event => event.id.toString() === id))
    .filter(Boolean)
    .map(formatEvent);
  log.info(
    { total: idsToInsert.length, count: eventsToInsert.length },
    "insertable events"
  );

  // insert the events
  const insertPromises = eventsToInsert.map(async event => {
    try {
      await GoCardsGame.insertOne(knex, event);
      log.debug(`inserted event with ID "${event.externalId}"`);
      return 1;
    } catch (error) {
      log.error(error, `unable to insert event with ID "${event.externalId}"`);
      return 0;
    }
  });

  // log the outcome
  const insertResults = await Promise.all(insertPromises);
  const insertedCount = insertResults.reduce(
    (count, result) => count + result,
    0
  );
  log.info(
    { total: eventsToInsert.length, count: insertedCount },
    "events inserted"
  );
}

async function updateEvents(events) {
  // determine which events in the database can be updated
  const values = events.map(event => [
    event.id.toString(),
    event.inputChecksum,
  ]);
  const idsToUpdate = await GoCardsGame.getIdsByNewChecksumsFromValuesArray(
    knex,
    values
  );

  if (!idsToUpdate || !idsToUpdate.length) {
    log.info({ total: 0 }, "no updatable events");
    return;
  }

  // map the updatable IDs to event data
  const eventsToUpdate = idsToUpdate
    .map(({ id, externalId }) => {
      const event = events.find(event => event.id.toString() === externalId);
      if (!event) return;
      return [id, formatEvent(event)];
    })
    .filter(Boolean);
  log.info(
    { total: idsToUpdate.length, count: eventsToUpdate.length },
    "updatable events"
  );

  // update the events
  const updatePromises = eventsToUpdate.map(async ([id, event]) => {
    try {
      await GoCardsGame.patchOneById(knex, id, event);
      log.debug(
        `updated event with ID "${id}" and external ID "${event.externalId}"`
      );
      return 1;
    } catch (error) {
      log.error(
        error,
        `unable to update event with ID "${id}" and external ID "${event.externalId}"`
      );
      return 0;
    }
  });

  // log the outcome
  const updateResults = await Promise.all(updatePromises);
  const updatedCount = updateResults.reduce(
    (count, result) => count + result,
    0
  );
  log.info(
    { total: eventsToUpdate.length, count: updatedCount },
    "events updated"
  );
}

function formatEvent(event) {
  return {
    externalId: event.id.toString(),
    teamId: event.teamId,
    team: event.team,
    sport: event.sport,
    sportSex: event.sportSex || null,
    opponent: event.opponent,
    location: event.location || null,
    isHome: event.isHome,
    startAt: event.start,
    result: event.result || null,
    scoreType: event.scoreType || null,
    scoreHome: event.scoreHome,
    scoreAway: event.scoreAway,
    extras: event.extras || null,
    url: event.url || null,
    inputChecksum: event.inputChecksum,
  };
}

// call main() if this file is the entry script
if (require.main === module) {
  process.on("unhandledRejection", async error => {
    console.error(error);
    await knex.destroy();
    process.exit(1);
  });
  main();
}
