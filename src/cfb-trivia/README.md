# cfb-trivia

Finds the latest trivia submission on the /r/CFB subreddit, crossposts it to the
subreddit configured via the REDDIT_SUBREDDIT environment variable, and posts a
comment to the new submission encouraging users to play for our trivia team.

## Installation

See the [main README.md] for initial installation details.

[main README.md]: ../../

### systemd

A systemd service and timer should be set up to check the /r/CFB subreddit
periodically for new trivia submissions.

```shell script
# install the service and timer
cp path/to/cfb-trivia.service /etc/systemd/system
cp path/to/cfb-trivia.timer /etc/systemd/system

# enable the timer to start on boot
systemctl enable cfb-trivia.timer
# start the timer immediately
systemctl start cfb-trivia.timer

# if you want to test the service without waiting for the timer
systemctl start cfb-trivia.service
```
