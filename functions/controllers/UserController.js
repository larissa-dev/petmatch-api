const connection = require('./../database/connection');
const jwt = require('jsonwebtoken');
const storage = require('./../services/FileUpload');

module.exports = {
  async login (request, response) {
    const {
      googleId,
      displayName,
      email,
      photoUrl
    } = request.body;

    try {
      const user = await connection('users')
        .where('email', email)
        .select()
        .first();

      let id;

      if (!user) {
        [id] = await connection('users').insert({
          google_id: googleId,
          name: displayName,
          email: email,
          pictures: JSON.stringify([photoUrl])
        });
      }

      id = id ? id : user.id;

      const token = jwt.sign({ id }, '878D79A6F6FB3DBBA9A4689C49A31F5ACA9FC99DF3920C335C0142DA128BE00C');

      response.json({
        success: true,
        token: token
      });
    } catch (err) {
      console.log(err)
      response.json({
        success: false,
        error: err
      });
    }
  },

  async profile (request, response) {
    const token = request.headers['x-access-token'];
    console.log('token', request.headers)

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

      const user = await connection('users')
        .where('id', request.userId)
        .select()
        .first();

      user.pictures = JSON.parse(user.pictures);

      response.json({
        success: true,
        code: 200,
        user: user
      });
    } else {
      response.json({
        success: false,
        code: 401,
        error: 'Não autorizado'
      });
    }
  },

  async updateProfile (request, response) {
    const token = request.headers['x-access-token'];
    const {
      about,
      age,
      phone,
      gender
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

      const pictures = [];

      for (let index = 1; index <= 7; index++) {
        if (request.body[`photo${index}`]) {
          pictures.push(request.body[`photo${index}`]);
        }

        if (request.files && request.files[`photo${index}`]) {
          // eslint-disable-next-line no-await-in-loop
          await storage(request.files[`photo${index}`][0])
            .then(url => pictures.push(url));
        }
      }

      const user = await connection('users')
        .where('id', request.userId)
        .update({
          about,
          age,
          phone,
          gender,
          pictures: JSON.stringify(pictures)
        });

      if (user) {
        response.json({
          success: true,
          status: 200
        });

        return;
      }

      response.json({
        success: false,
        status: 500
      });

      return;
    }

    response.json({
      success: false,
      status: 401
    });

    return;
  },

  async setLocation(request, response) {
    const token = request.headers['x-access-token'];
    const {
      latitude,
      longitude
    } = request.body;

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

    const user = await connection('users')
      .where('id', request.userId)
      .update({
        latitude,
        longitude
      });

    if (user) {
      response.json({
        success: true,
        status: 200
      });

      return;
    }

    response.json({
      success: false,
      status: 500
    });

    return;
  }
};
