# cfb-trivia

Retrieves all of the events on the gocards.com sports calendar and inserts them
into the database.

## Installation

See the [main README.md] for initial installation details.

[main README.md]: ../../README.md

### systemd

A systemd service and timer should be set up to pull the calendar events
periodically.

```shell script
# install the service and timer
cp path/to/pull-gocards-calendar.service /etc/systemd/system
cp path/to/pull-gocards-calendar.timer /etc/systemd/system

# enable the timer to start on boot
systemctl enable pull-gocards-calendar.timer
# start the timer immediately
systemctl start pull-gocards-calendar.timer

# if you want to test the service without waiting for the timer
systemctl start pull-gocards-calendar.service
```
