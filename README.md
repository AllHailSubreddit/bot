# /u/AllHail_Bot

[![Docker Build Status](https://img.shields.io/docker/cloud/build/allhail/bot)](https://hub.docker.com/r/allhail/bot/builds)

A collection of Node.js scripts that control /u/AllHail_Bot.

## Installation

This section covers the basic steps to set up the environment. Each script has
its own installation steps, found in its README.md, that must be followed after
the steps below.

- Ensure Docker is installed.
- Copy [docker-compose.example.yml] to a directory such as  
  `/etc/opt/allhail/bot` or `~/`, removing `.example` from the filename.
- Copy [.env.example] to the same directory, removing `.example` from the  
  filename.
- Ensure values in both files are filled out and correct.

[docker-compose.example.yml]: docker-compose.example.yml

## Usage

Scripts can be run via docker-compose from the working directory of the
`docker-compose.yml` configuration file.

```shell script
docker-compose run --rm allhail/bot NAME_OF_SCRIPT
```

Script directories also contain systemd unit files that can be installed,
allowing the scripts to be controlled via `systemctl` and logs to be examined
via `journalctl`.

### Scripts

- [migrate](src/migrate)  
  Upgrades the database schema.
- [cfb-trivia](src/cfb-trivia)  
  Finds the latest trivia submission on the /r/CFB subreddit, crossposts it to
  the subreddit configured via the `REDDIT_SUBREDDIT` environment variable, and
  posts a comment to the new submission encouraging users to play for our trivia
  team.
