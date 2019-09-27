const tableName = 'templates';

exports.up = function(knex) {
  return knex.schema.createTable(tableName, table => {
    table.uuid('id')
      .unique()
      .defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name')
      .notNullable();
    table.jsonb('model');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable(tableName);
};
