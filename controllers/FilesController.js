/* import dbClient from '../utils/db'; */
const { getUserFromToken } = require('../utils/tools');

class FilesController {
  static async postUpload(request, response) {
    const { 'x-token': token } = request.headers;
    const user = await getUserFromToken(token);
    if (user !== null) {
      response.status(200).send(user);
    } else {
      response.status(401).send({ error: 'Unauthorized' });
    }
  }
}

module.exports = FilesController;
