const tableName = 'dungeons';

exports.up = function(knex) {
  return knex.schema.table(tableName, table => {
    table.boolean('is_active')
      .defaultsTo(true);
  });
}

exports.down = function(knex) {
  return knex.schema.table(tableName, table => {
    table.dropColumn('is_active');
  });
};
