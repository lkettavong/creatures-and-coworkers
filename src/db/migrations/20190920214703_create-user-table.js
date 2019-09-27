const tableName = 'users';

exports.up = function(knex) {
  return knex.schema.createTable(tableName, table => {
    table.uuid('id')
      .unique()
      .defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('display_name')
      .notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable(tableName);
};
