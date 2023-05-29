import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';

const { v4: uuid } = require('uuid');
const fs = require('fs');
const path = require('path');

const { getUserFromToken } = require('../utils/tools');

class FilesController {
  static async postUpload(request, response) {
    const { 'x-token': token } = request.headers;
    const {
      name = false,
      type = false,
      parentId = 0,
      isPublic = false,
      data = false,
    } = request.body;
    const user = await getUserFromToken(token);
    const supportedFiles = ['folder', 'file', 'image'];
    if (user !== null) {
      if (name === false) {
        return response.status(400).send({ error: 'Missing name' });
      }

      if (!supportedFiles.includes(type)) {
        return response.status(400).send({ error: 'Missing type' });
      }

      if (type !== 'folder' && data === false) {
        return response.status(400).send({ error: 'Missing data' });
      }

      if (parentId !== 0) {
        const parentFile = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(parentId) });

        if (!parentFile) {
          return response.status(400).send({ error: 'Parent not found' });
        }

        if (parentFile.type !== 'folder') {
          return response.status(400).send({ error: 'Parent is not a folder' });
        }
      }

      const file = {
        userId: user._id,
        name,
        type,
        isPublic,
        parentId,
      };

      if (type === 'folder') {
        const result = await dbClient.client.db().collection('files').insertOne(file);
        const insertedFile = result.ops[0];
        return response.status(201).send({
          id: insertedFile._id,
          userId: insertedFile.userId,
          name: insertedFile.name,
          type: insertedFile.type,
          isPublic: insertedFile.isPublic,
          parentId: insertedFile.parentId,
        });
      }

      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const filePath = path.join(folderPath, uuid());
      const fileContent = Buffer.from(data, 'base64');

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }

      fs.writeFileSync(filePath, fileContent);

      file.localPath = filePath;

      const result = await dbClient.client.db().collection('files').insertOne(file);
      const insertedFile = result.ops[0];

      return response.status(201).send({
        id: insertedFile._id,
        userId: insertedFile.userId,
        name: insertedFile.name,
        type: insertedFile.type,
        isPublic: insertedFile.isPublic,
        parentId: insertedFile.parentId,
      });
    }
    return response.status(401).send({ error: 'Unauthorized' });
  }
}

module.exports = FilesController;
