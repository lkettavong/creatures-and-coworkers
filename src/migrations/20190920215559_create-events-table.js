const tableName = 'events';

exports.up = function(knex) {
  return knex.schema.createTable(tableName, table => {
    table.uuid('id')
      .unique()
      .defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('dungeon_id')
      .notNullable();
    table.foreign('dungeon_id').references('dungeons.id')
    table.uuid('user_id')
      .notNullable();
    table.foreign('user_id').references('users.id')
    table.string('type')
      .notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable(tableName);
};
