const connection = require('./../database/connection');
const mysql = require('./../database/mysql');
const jwt = require('jsonwebtoken');

module.exports = {
  async getNearestPets(request, response) {
    const token = request.headers['x-access-token'];
    console.log(token)

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
    }

    console.log(request.userId)

    const user = await connection('users')
      .where('id', request.userId)
      .select()
      .first();

    const userSettings = await connection('settings')
      .where('user_id', request.userId)
      .select()
      .first();

    if (user && userSettings) {
      if (
        !JSON.parse(userSettings.categories).length ||
        !JSON.parse(userSettings.search_by).length
      ) {
        response.json({
          success: false,
          code: 500,
          error: 'empty_categories_types'
        });

        return
      }

      const userInteractions = await connection('users_approved_denied_pets')
        .where({
          user_id: request.userId,
        })
        .select()

      const petsId = []

      userInteractions.forEach(el => petsId.push(el.pet_id))

      mysql.query(
        `SELECT
          p.*,
          ROUND(SQRT(POW(u.latitude - (${user.latitude}), 2) + POW(u.longitude - (${user.longitude}), 2)) * 100 , 2) AS distancy
        FROM
          users AS u
        JOIN pets AS p
          ON u.id = p.user_id
        WHERE
          u.latitude IS NOT NULL
        AND
          u.longitude IS NOT NULL
        AND
          u.id != ${user.id}
        AND
          p.type IN (${JSON.parse(userSettings.categories).map(item => "'" + item.replace("'", "''") + "'").join()})
        AND
          p.category IN (${JSON.parse(userSettings.search_by).map(item => "'" + item.replace("'", "''") + "'").join()})
        ${petsId.length ? `AND p.id NOT IN (${petsId.map(item => "'" + item + "'").join()})` : ''}
        AND
          ROUND(SQRT(POW(u.latitude - (${user.latitude}), 2) + POW(u.longitude - (${user.longitude}), 2)) * 100 , 2) < ${userSettings.distance}
        ORDER BY
          distancy ASC
        LIMIT 200;`,
        async (err, results) => {
          if (err) {
            response.json({
              success: false,
              code: 500,
              error: err
            });

            return;
          }

          response.json({
            success: true,
            pets: results
          });
        });

        return;
    }

    response.json({
      success: false,
      code: 500,
    });
  }
};
