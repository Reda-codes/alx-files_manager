import dbClient from '../utils/db';

const { getUserFromToken, hashPassword } = require('../utils/tools');

class UsersController {
  static async postNew(request, response) {
    const { email = false, password = false } = request.body;
    if (!email) {
      return response.status(400).send({ error: 'Missing email' });
    } if (!password) {
      return response.status(400).send({ error: 'Missing password' });
    }
    try {
      const user = await dbClient.client.db().collection('users').findOne({ email });
      if (user !== null) {
        return response.status(400).send({ error: 'Already exist' });
      }
      const hashed = hashPassword(password);
      const result = await dbClient.client.db().collection('users').insertOne({ email, password: hashed });
      return response.status(201).send({ id: result.insertedId, email });
    } catch (error) {
      return response.status(500).send({ error: 'Internal server error' });
    }
  }

  static async getMe(request, response) {
    const { 'x-token': token } = request.headers;
    const user = await getUserFromToken(token);
    if (user !== null) {
      return response.send({ id: user._id, email: user.email });
    }
    return response.status(401).send({ error: 'Unauthorized' });
  }
}

module.exports = UsersController;
