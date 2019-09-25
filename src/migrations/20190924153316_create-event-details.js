const tableName = 'event_details';

exports.up = function(knex) {
  return knex.schema.createTable(tableName, table => {
    table.uuid('id')
      .unique()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('event_id')
      .notNullable();
    table.foreign('event_id').references('events.id')

    table.string('name')
      .notNullable();

    table.jsonb('value')
      .notNullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable(tableName);
};
