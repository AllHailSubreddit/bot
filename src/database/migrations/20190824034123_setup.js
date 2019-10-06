exports.up = async knex => {
  await knex.schema.raw(`create extension if not exists pgcrypto;`);
  await knex.schema.raw(`
      create or replace function update_updated_at_column ()
          returns trigger
          as $$
      begin
          NEW.updated_at = now();
          return NEW;
      end;
      $$
      language plpgsql;
  `);
};

exports.down = async knex => {
  await knex.schema.raw(`drop function if exists update_updated_at_column;`);
  await knex.schema.raw(`drop extension if exists pgcrypto;`);
};
