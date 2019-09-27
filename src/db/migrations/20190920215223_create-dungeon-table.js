const tableName = 'dungeons';

exports.up = function(knex) {
  return knex.schema.createTable(tableName, table => {
    table.uuid('id')
      .unique()
      .defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('template_id')
      .notNullable();
    table.foreign('template_id').references('templates.id')
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable(tableName);
};
