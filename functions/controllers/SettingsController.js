const connection = require('./../database/connection');
const jwt = require('jsonwebtoken');

module.exports = {
  async get(request, response) {
    const token = request.headers['x-access-token'];

    if (token) {
      jwt.verify(token, '878D79A6F6FB3DBBA9A4689C49A31F5ACA9FC99DF3920C335C0142DA128BE00C', (err, decoded) => {
        if (err) {
          response.json({
            success: false,
            code: 400,
            error: 'Erro ao autenticar usuário'
          });
        }

        request.userId = decoded.id;
      });

      const settings = await connection('settings')
        .where('user_id', request.userId)
        .select()
        .first();

        console.log(request.userId)

      if (settings && settings.categories) {
        settings.categories = JSON.parse(settings.categories);
      }

      if (settings && settings.search_by) {
        settings.search_by = JSON.parse(settings.search_by);
      }

      response.json({
        success: true,
        code: 200,
        settings: settings
      });

      return;
    }

    response.json({
      success: false,
      code: 400,
      error: 'Token não encontrado'
    });
  },

  async saveSettings(request, response) {
    const token = request.headers['x-access-token'];
    const {
      active,
      search_by,
      distance,
      categories,
      notifications_matches,
      notifications_messages
    } = request.body;

    if (token) {
      jwt.verify(token, '878D79A6F6FB3DBBA9A4689C49A31F5ACA9FC99DF3920C335C0142DA128BE00C', (err, decoded) => {
        if (err) {
          response.json({
            success: false,
            code: 500,
            error: 'Erro ao autenticar usuário'
          });
        }

        request.userId = decoded.id;
      });

      const settings = await connection('settings')
        .where('user_id', request.userId)
        .select();

      if (settings.length) {
        await connection('settings')
          .where('user_id', request.userId)
          .update({
            active,
            search_by,
            distance,
            categories,
            notifications_matches,
            notifications_messages
          });
      } else {
        await connection('settings')
          .insert({
            user_id: request.userId,
            active,
            search_by: JSON.stringify(search_by),
            distance,
            categories: JSON.stringify(categories),
            notifications_matches,
            notifications_messages
          });
      }

      response.json({
        success: true,
        code: 200
      });
    }
  }
};
