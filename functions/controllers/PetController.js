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

      for (let index = 0; index < pets.length; index++) {
        pets[index].pictures = JSON.parse(pets[index].pictures);
      }

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
      species
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

    const pictures = [];

    for (let index = 1; index <=6; index++) {
      if (request.body[`photo${index}`]) {
        pictures.push(request.body[`photo${index}`]);
      }

      if (request.files[`photo${index}`]) {
        // eslint-disable-next-line no-await-in-loop
        await storage(request.files[`photo${index}`][0])
          .then(url => pictures.push(url));
      }
    }


    const pet = await connection('pets')
      .insert({
        name,
        about,
        age,
        gender,
        species,
        pictures: JSON.stringify(pictures),
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

    const {
      name,
      about,
      age,
      gender,
      species
    } = request.body;

    const pictures = [];

    for (let index = 1; index <=6; index++) {
      if (request.body[`photo${index}`]) {
        pictures.push(request.body[`photo${index}`]);
      }

      if (request.files[`photo${index}`]) {
        // eslint-disable-next-line no-await-in-loop
        await storage(request.files[`photo${index}`][0])
          .then(url => pictures.push(url));
      }
    }

    const pet = await connection('pets')
      .where('id', id)
      .update({
        name,
        about,
        age,
        gender,
        species,
        pictures: JSON.stringify(pictures),
        user_id: request.userId
      });

    response.json({
      success: true,
      code: 200,
      pet: pet
    });
  }
};
