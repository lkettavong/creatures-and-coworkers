const tableName = 'loots';

exports.up = function(knex) {
  return knex.schema.table(tableName, table => {
    table.dropColumn('deleted_at');
  });
};

exports.down = function(knex) {
  return knex.schema.table(tableName, table => {
    table.timestamp('deleted_at').defaultsTo(knex.fn.now());
  });
};
