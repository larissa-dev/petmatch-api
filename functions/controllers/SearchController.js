/**
 *
  SELECT
      ROUND(SQRT(POW(u.latitude - ({$lat}), 2) + POW(u.longitude - ({$lng}), 2)) * 100 , 2) AS distancy,
      u.id
  FROM
      users AS u
  JOIN pets AS p
      ON u.id = p.user_id
  JOIN services AS s
      ON s.id IN ({$bindingsString})
  WHERE
      u.latitude IS NOT NULL
  AND
      u.longitude IS NOT NULL
  AND
      ROUND(SQRT(POW(u.latitude - ({$lat}), 2) + POW(u.longitude - ({$lng}), 2)) * 100 , 2) < 700
  ORDER BY
      distancy ASC
  LIMIT 200
 */

const connection = require('./../database/connection');
const mysql = require('./../database/mysql');
const jwt = require('jsonwebtoken');

module.exports = {
  async getNearestPets(request, response) {
    const token = request.headers['x-access-token'];

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

    const user = await connection('users')
      .where('id', request.userId)
      .select()
      .first();

    const pets = await mysql.connect(error => {
      if (error) {
        response.json({
          success: false,
          code: 500,
        });
      }

      mysql.query(
        `SELECT
          ROUND(SQRT(POW(u.latitude - (${user.latitude}), 2) + POW(u.longitude - (${user.longitude}), 2)) * 100 , 2) AS distancy,
          u.id
        FROM
          users AS u
        JOIN pets AS p
          ON u.id = p.user_id
        WHERE
          u.latitude IS NOT NULL
        AND
          u.longitude IS NOT NULL
        ORDER BY
          distancy ASC
        LIMIT 200`,
        (err, result) => {
          if (err) {
            response.json({
              success: false,
              code: 500,
            });
          }
          console.log(result);
        });
    });

  }
};
