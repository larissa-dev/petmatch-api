exports.up = knex =>
  knex.schema.createTable('pets', table => {
    table.increments('id');
    table.string('name').notNullable();
    table.text('about');
    table.integer('age');
    table.string('gender');
    table.string('species');
    table.json('pictures');
    table.integer('status');
    table.integer('user_id');
  });

exports.down = knex => knex.schema.dropTable('pets');
