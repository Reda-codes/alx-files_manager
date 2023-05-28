import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import { hashPassword } from '../utils/tools';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(request, response) {
    const { email = false, password = false } = request.body;
    if (!email) {
      response.status(400).send({ error: 'Missing email' });
    } else if (!password) {
      response.status(400).send({ error: 'Missing password' });
    } else {
      try {
        const user = await dbClient.client.db().collection('users').findOne({ email });
        if (user !== null) {
          response.status(400).send({ error: 'Already exist' });
        } else {
          const hashed = hashPassword(password);
          const result = await dbClient.client.db().collection('users').insertOne({ email, password: hashed });
          response.status(201).send({ id: result.insertedId, email });
        }
      } catch (error) {
        response.status(500).send({ error: 'Internal server error' });
      }
    }
  }

  static async getMe(request, response) {
    const { 'x-token': token } = request.headers;
    const userId = await redisClient.get(`auth_${token}`);
    if (userId) {
      const user = await dbClient.client.db().collection('users').findOne({ _id: ObjectId(userId) });
      if (user !== null) {
        response.status(201).send({ id: user._id, email: user.email });
      } else {
        response.status(401).send({ error: 'Unauthorized' });
      }
    } else {
      response.status(401).send({ error: 'Unauthorized' });
    }
  }
}

module.exports = UsersController;