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

      await connection('users_approved_denied_pets')
        .insert({
          user_id: request.userId,
          pet_id: pet.id
        })

      response.json({
        success: true,
        match: true,
        code: 200,
      })

      return
    } else {

      const hasLikedOne = await connection('cruzamento_matches')
        .where('one_user_id', request.userId)
        .where('two_user_id', pet.user_id)
        .select()
        .first()

      const hasLikedrTwo = await connection('cruzamento_matches')
        .where('two_user_id', request.userId)
        .where('one_user_id', pet.user_id)
        .select()
        .first()

      if (!hasLikedOne) {
        await connection('cruzamento_matches')
          .insert({
            one_user_id: request.userId,
            one_user_liked: true,
            two_user_id: pet.user_id,
            two_user_liked: false
          })

        await connection('users_approved_denied_pets')
          .insert({
            user_id: request.userId,
            pet_id: pet.id
          })

          response.json({
            success: true,
            match: false,
            code: 200,
          })

          return
      }

      if (hasLikedrTwo.two_user_id === request.userId) {
        await connection('cruzamento_matches')
          .where('id', hasLikedrTwo.id)
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

    const cruzamentoMatchesOne = await connection('cruzamento_matches')
      .join('users', function() {
        this.on('cruzamento_matches.two_user_id', '=', 'users.id')
      })
      .where('one_user_liked', 1)
      .where('two_user_liked', 1)
      .where('one_user_id', request.userId)
      .select()

    const cruzamentoMatchesTwo = await connection('cruzamento_matches')
      .join('users', function() {
        this.on('cruzamento_matches.one_user_id', '=', 'users.id')
      })
      .where('one_user_liked', 1)
      .where('two_user_liked', 1)
      .where('two_user_id', request.userId)
      .select()

    let matches = await connection('matches')
      .join('users', 'matches.user_id', 'users.id')
      .where('user_id', request.userId)
      .where('user_liked', 1)
      .select()

    matches = matches.concat(cruzamentoMatchesOne);
    matches = matches.concat(cruzamentoMatchesTwo);

    response.json({
      success: true,
      matches
    })

    return
  },

  async denyPet(request, response) {
    const token = request.headers['x-access-token'];
    const { petId } = request.body

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

    await connection('users_approved_denied_pets')
      .insert({
        user_id: request.userId,
        pet_id: petId
      })

    response.json({
      success: true
    })
  }
}
