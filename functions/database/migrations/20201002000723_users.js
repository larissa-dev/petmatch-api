exports.up = knex =>
  knex.schema.createTable('users', table => {
    table.increments('id');
    table.string('google_id');
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.text('about');
    table.integer('age');
    table.string('phone');
    table.string('gender');
    table.float('latitude');
    table.float('longitude');
    table.json('pictures');
  });

exports.down = knex => knex.schema.dropTable('users');
