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
          photo: photoUrl
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

      response.json({
        success: true,
        code: 200,
        user: user
      });

      return;
    } else {
      response.json({
        success: false,
        code: 401,
        error: 'Não autorizado'
      });
    }

    return;
  },

  async updateProfile (request, response) {
    const token = request.headers['x-access-token'];
    const {
      about,
      age,
      phone,
      gender,
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

      const user = await connection('users')
        .where('id', request.userId)
        .update({
          about,
          age,
          phone,
          gender,
          photo
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
