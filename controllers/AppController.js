import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  static getStatus(_request, response) {
    const redisStatus = redisClient.isAlive();
    const mongoStatus = dbClient.isAlive();
    return response.status(200).send({ redis: redisStatus, db: mongoStatus });
  }

  static async getStats(_request, response) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    return response.status(200).send({ users, files });
  }
}

module.exports = AppController;
