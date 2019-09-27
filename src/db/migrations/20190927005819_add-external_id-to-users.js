const tableName = 'users';

exports.up = function(knex) {
  return knex.schema.table(tableName, table => {
    table.string('external_id')
      .unique()
      .notNullable()
      .defaultTo(knex.raw('uuid_generate_v4()'));
  });
};

exports.down = function(knex) {
  return knex.schema.table(tableName, table => {
    table.dropColumn('external_id');
  });
};
