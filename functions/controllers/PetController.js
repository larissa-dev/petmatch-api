const connection = require('./../database/connection');
const jwt = require('jsonwebtoken');
const storage = require('./../services/FileUpload');

module.exports = {
  async index (request, response) {
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

      const pets = await connection('pets')
        .where('user_id', request.userId)
        .select();

      response.json({
        success: true,
        code: 200,
        pets: pets
      });
    }
  },

  async create (request, response) {
    const token = request.headers['x-access-token'];
    const {
      name,
      about,
      age,
      gender,
      species,
      category,
      type,
      photo
    } = request.body;
    
    console.log(request.body);

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

    const pet = await connection('pets')
      .insert({
        name,
        about,
        age,
        gender,
        species,
        photo,
        type,
        category,
        user_id: request.userId
      });

    response.json({
      success: true,
      code: 200,
      pet: pet
    });
  },

  async update (request, response) {
    const token = request.headers['x-access-token'];
    const { id } = request.params;
    const {
      name,
      about,
      age,
      gender,
      species,
      category,
      type,
      photo
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
    }

    const pet = await connection('pets')
      .where('id', id)
      .update({
        name,
        about,
        age,
        gender,
        species,
        photo,
        type,
        category,
        user_id: request.userId
      });

    response.json({
      success: true,
      code: 200,
      pet: pet
    });
  },

  async delete(request, response) {
    const token = request.headers['x-access-token'];
    const { id } = request.params;

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

    const pet = await connection('pets')
      .where('id', id)
      .del();

    response.json({
      success: true,
      code: 200
    });
  }
};
