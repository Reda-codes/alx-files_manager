import { v4 as uuid } from 'uuid';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import { userCredentials } from '../utils/tools';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(request, response) {
    const { authorization } = request.headers;
    const { email, password } = userCredentials(authorization);
    const user = await dbClient.client.db().collection('users').findOne({ email, password });
    if (user !== null) {
      const token = uuid();
      redisClient.set(`auth_${token}`, user._id, 86400);
      response.status(200).send({ token });
    } else {
      response.status(401).send({ error: 'Unauthorized' });
    }
  }

  static async getDisconnect(request, response) {
    const { 'x-token': token } = request.headers;
    const userId = await redisClient.get(`auth_${token}`);
    if (userId) {
      const user = await dbClient.client.db().collection('users').findOne({ _id: ObjectId(userId) });
      if (user !== null) {
        await redisClient.del(`auth_${token}`);
        response.status(201).send();
      } else {
        response.status(401).send({ error: 'Unauthorized' });
      }
    } else {
      response.status(401).send({ error: 'Unauthorized' });
    }
  }
}

module.exports = AuthController;
