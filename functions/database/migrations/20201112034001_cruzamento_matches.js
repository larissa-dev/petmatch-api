
exports.up = knex =>
knex.schema.createTable('cruzamento_matches', table => {
  table.increments('id');
  table.integer('one_user_id');
  table.boolean('one_user_liked');
  table.integer('two_user_id');
  table.boolean('two_user_liked');
  table.timestamp('date').nullable();
});

exports.down = knex => knex.schema.dropTable('pending_matches');
