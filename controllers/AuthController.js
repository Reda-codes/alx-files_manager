import { v4 as uuid } from 'uuid';
import redisClient from '../utils/redis';

const { getUserFromToken, getUserFromHeader } = require('../utils/tools');

class AuthController {
  static async getConnect(request, response) {
    const { authorization } = request.headers;
    const user = await getUserFromHeader(authorization);
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
    const user = await getUserFromToken(token);
    if (user !== null) {
      await redisClient.del(`auth_${token}`);
      response.status(204).send();
    } else {
      response.status(401).send({ error: 'Unauthorized' });
    }
  }
}

module.exports = AuthController;
