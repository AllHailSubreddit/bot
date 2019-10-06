exports.up = async knex => {
  await knex.schema.createTable("gocards_game", table => {
    table
      .uuid("id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));
    table.text("external_id").notNullable();
    table.specificType("team_id", "smallint").notNullable();
    table.text("team").notNullable();
    table.text("sport").notNullable();
    table.text("sport_sex");
    table.text("opponent").notNullable();
    table.text("location");
    table.boolean("is_home").notNullable();
    table.timestamp("start_at", { useTz: true }).notNullable();
    table.string("result", 1);
    table.text("score_type");
    table.specificType("score_home", "smallint");
    table.specificType("score_away", "smallint");
    table.jsonb("extras");
    table.text("url");
    table.string("input_checksum", 32).notNullable();
    // table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
    // table.timestamp("updated_at", { useTz: true }).defaultTo(knex.fn.now());
    table.timestamps(true, true);
  });
  // add the update_at trigger
  await knex.schema.raw(`
      create trigger trigger_gocards_game_update_updated_at_column
        before update on gocards_game for each row
        when (OLD.* is distinct from NEW.*)
        execute function update_updated_at_column ();
  `);
};

exports.down = async knex => knex.schema.dropTableIfExists("gocards_game");
