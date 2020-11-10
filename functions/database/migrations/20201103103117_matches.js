
exports.up = knex =>
knex.schema.createTable('matches', table => {
  table.increments('id');
  table.integer('user_id');
  table.integer('pet_id');
  table.timestamp('date').nullable();
});

exports.down = knex => knex.schema.dropTable('matches');
