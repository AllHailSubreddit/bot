#!/usr/bin/env sh

cd /opt/allhailbot

# pull the new code and ensure dependencies are installed
git pull
npm install --production

# set up cron
cp -f cron /etc/cron.d/allhailbot
chown root /etc/cron.d/allhailbot
chmod 644 /etc/cron.d/allhailbot

# set up logrotate
cp -f logrotate /etc/logrotate.d/allhailbot
