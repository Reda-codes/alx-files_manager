import dbClient from '../utils/db';
import { hashPassword } from '../utils/tools';

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
}

module.exports = UsersController;
