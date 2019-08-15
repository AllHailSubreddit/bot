## migrate

Upgrades the database schema.

## Installation

See the [main README.md] for initial installation details.

[main README.md]: ../../

### systemd

A systemd service should be set up to run the migration(s).

```shell script
# install the service and timer
cp path/to/migrate.service /etc/systemd/system

# to run the migration(s)
systemctl start migrate.service
```
