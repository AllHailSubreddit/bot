# /u/AllHail_Bot

[![Docker Build Status](https://img.shields.io/docker/cloud/build/allhail/bot)](https://hub.docker.com/r/allhail/bot/builds)

A collection of Node.js scripts that perform the functions of /u/AllHail_Bot.

**Scripts:**

- [cfb-trivia](./cfb-trivia)  
  Finds the latest trivia submission on the /r/CFB subreddit, crossposts it to
  the subreddit configured via the `REDDIT_SUBREDDIT` environment variable, and
  posts a comment to the new submission encouraging users to play for our trivia
  team.
- [migrate](./migrate)  
  Upgrades the database schema.

## Installation


