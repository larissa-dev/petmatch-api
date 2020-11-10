exports.up = knex =>
  knex.schema.createTable('settings', table => {
    table.increments('id');
    table.integer('user_id');
    table.boolean('active');
    table.json('search_by');
    table.integer('distance');
    table.json('categories');
    table.boolean('notifications_matches');
    table.boolean('notifications_messages');
  });

exports.down = knex => knex.schema.dropTable('settings');
