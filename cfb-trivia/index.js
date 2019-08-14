const {
  LOG_LEVEL,
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_PASSWORD,
  REDDIT_SUBREDDIT,
  REDDIT_USERNAME,
} = process.env;
const { version: VERSION } = require("../package");
const pino = require("pino");
const Snoowrap = require("snoowrap");

// globals
const logger = pino({ level: LOG_LEVEL });
const reddit = new Snoowrap({
  userAgent: `nodejs:org.allhail.bot.cfb-trivia:v${VERSION} (by /u/pushECX)`,
  clientId: REDDIT_CLIENT_ID,
  clientSecret: REDDIT_CLIENT_SECRET,
  username: REDDIT_USERNAME,
  password: REDDIT_PASSWORD,
});

async function main() {
  logger.info("start");

  try {
    const [result] = await reddit.search({
      query: ["subreddit:CFB", "self:yes", 'title:"Trivia Tuesday"'].join(" "),
      time: "week",
      sort: "new",
      syntax: "lucene",
      limit: 1,
    });

    // return early if no post was found
    if (!result) {
      logger.error("no submission found");
      logger.info("complete");
      return;
    }

    logger.info(`found trivia submission: ${result.url}`);
    const submission = await reddit
      .getSubreddit(REDDIT_SUBREDDIT)
      .submitLink({
        title: "Join us in playing Trivia Tuesday over on /r/CFB!",
        url: result.url,
        sendReplies: false,
        resubmit: false,
      })
      .fetch();
    logger.info(`created submission: ${submission.permalink}`);
    await submission.distinguish();
    const comment = await submission
      .reply(
        `
As occurs every Tuesday, we're playing Trivia Tuesday over on /r/CFB and we'd
like you to join!

Instructions, standings, etc. can be found in [this week's Trivia Tuesday
thread](${result.url}), so head on over there!

---

*I am a bot. If you notice anything off with this post or with my behavior,
please message the moderators.*`
      )
      .fetch();
    await comment.distinguish({ sticky: true });
    logger.info(`created comment: ${comment.permalink}`);
  } catch (error) {
    logger.error(error);
  }

  logger.info("complete");
}

// call main() if this file is the entry script
if (require.main === module) {
  main();
}
