
exports.up = knex =>
knex.schema.createTable('users_approved_denied_pets', table => {
  table.increments('id');
  table.integer('user_id');
  table.integer('pet_id');
});

exports.down = knex => knex.schema.dropTable('users_approved_denied_pets');
