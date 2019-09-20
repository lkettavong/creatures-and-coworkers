const tableName = 'loots';

exports.up = function(knex) {
  return knex.schema.createTable(tableName, table => {
    table.uuid('id')
      .unique()
      .defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id')
      .notNullable();
    table.foreign('user_id').references('users.id')
    table.string('name')
      .notNullable();
    table.string('property')
      .notNullable();
    table.integer('value')
      .notNullable();
    table.string('description')
      .notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable(tableName);
};
