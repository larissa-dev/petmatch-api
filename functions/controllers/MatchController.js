const connection = require('./../database/connection');
const mysql = require('./../database/mysql');
const jwt = require('jsonwebtoken');

module.exports = {
  async match(request, response) {
    const token = request.headers['x-access-token'];
    const {
      petId
    } = request.body

    if (token) {
      jwt.verify(token, '878D79A6F6FB3DBBA9A4689C49A31F5ACA9FC99DF3920C335C0142DA128BE00C', (err, decoded) => {
        if (err) {
          response.json({
            success: false,
            code: 500,
            error: 'Erro ao autenticar usuário'
          })

          return
        }

        request.userId = decoded.id
      })
    }

    const pet = await connection('pets')
      .where('id', petId)
      .select()
      .first();

    if (pet.category === 'Adoção' || pet.category === 'Desaparecido') {
      await connection('matches')
        .insert({
          user_id: request.userId,
          pet_id: pet.id,
          user_liked: true,
          pet_liked: true
        })

      response.json({
        success: true,
        match: true,
        code: 200,
      })

      return
    } else {

      const hasLiked = await connection('cruzamento_matches')
        .where('one_user_id', request.userId)
        .orWhere('two_user_id', request.userId)
        .select()
        .first()

      if (!hasLiked) {
        await connection('cruzamento_matches')
          .insert({
            one_user_id: request.userId,
            one_user_liked: true,
            two_user_id: pet.user_id,
            two_user_liked: false
          })

          response.json({
            success: true,
            match: false,
            code: 200,
          })

          return
      } else {
        if (hasLiked.two_user_id === request.userId) {
          await connection('cruzamento_matches')
            .where('id', hasLiked.id)
            .update({
              two_user_liked: true
            })

          response.json({
            success: true,
            match: true,
            code: 200,
          })

          return
        }
      }

    }

    response.json({
      success: true,
      match: false,
      code: 200,
    })
  },

  async getMatches(request, response) {
    const token = request.headers['x-access-token'];

    if (token) {
      jwt.verify(token, '878D79A6F6FB3DBBA9A4689C49A31F5ACA9FC99DF3920C335C0142DA128BE00C', (err, decoded) => {
        if (err) {
          response.json({
            success: false,
            code: 500,
            error: 'Erro ao autenticar usuário'
          })

          return
        }

        request.userId = decoded.id
      })
    }

    let matches = [];

    mysql.query(
      `SELECT
        cm.*,
        user_one.google_id AS google_id_one,
        user_two.google_id AS google_id_two
      FROM
        cruzamento_matches AS cm
      JOIN users AS user_one
        ON cm.one_user_id = user_one.id
      JOIN users AS user_two
        ON cm.two_user_id = user_two.id
      WHERE
        one_user_liked = 1
      AND
        two_user_liked = 1
      AND
        one_user_id = ${request.userId}
      OR
        two_user_id = ${request.userId}
      `,
      (err, results) => {
        if (results) {
          matches = matches.concat(results)
          console.log('results => ', matches)
        }
      }
    )

    mysql.query(
      `SELECT
        m.*,
        u.google_id AS google_id_one
      FROM
        matches AS m
      JOIN users AS u
        ON m.user_id = u.id
      JOIN pets AS p
        ON m.pet_id = p.id
      WHERE
        m.user_liked = 1
      AND
        m.user_id = ${request.userId}
      OR
        p.user_id = ${request.userId}
      `,
      (err, results) => {
        if (results) {
          matches = matches.concat(results)
          console.log('results => ', matches)
        }
      }
    )

    // const cruzamentoMatches = await connection('cruzamento_matches')
    //   .join('users', 'cruzamento_matches.one_user_id', 'users.id')
    //   .where('one_user_liked', 1)
    //   .where('two_user_liked', 1)
    //   .where('one_user_id', request.userId)
    //   .orWhere('two_user_id', request.userId)
    //   .select()

    // let matches = await connection('matches')
    //   .join('users', 'matches.user_id', 'users.id')
    //   .where('user_id', request.userId)
    //   .where('user_liked', 1)
    //   .select()

    // matches = matches.concat(cruzamentoMatches);



    response.json({
      success: true,
      matches
    })

    return
  }
}
