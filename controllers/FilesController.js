import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';

const mime = require('mime-types');

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

  static async getShow(request, response) {
    const { 'x-token': token } = request.headers;
    const { id } = request.params;
    const user = await getUserFromToken(token);
    if (user !== null) {
      const file = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(user._id) });
      if (file !== null) {
        return response.status(200).send({
          id: file._id,
          userId: file.userId,
          name: file.name,
          type: file.type,
          isPublic: file.isPublic,
          parentId: file.parentId,
        });
      }
      return response.status(404).send({ error: 'Not found' });
    }
    return response.status(401).send({ error: 'Unauthorized' });
  }

  static async getIndex(request, response) {
    const { 'x-token': token } = request.headers;
    const { parentId = '0', page = '0' } = request.query;
    const user = await getUserFromToken(token);
    if (user !== null) {
      const pageSize = 20;
      const skip = Number(page) * pageSize;

      if (parentId === '0') {
        const pipeline = [
          {
            $match: {
              userId: ObjectId(user._id),
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: pageSize,
          },
          {
            $project: {
              _id: 0,
              id: '$_id',
              userId: '$userId',
              name: '$name',
              type: '$type',
              isPublic: '$isPublic',
              parentId: '$parentId',
            },
          },
        ];

        const files = await dbClient.client
          .db()
          .collection('files')
          .aggregate(pipeline)
          .toArray();

        return response.status(200).send(files);
      }
      const pipeline = [
        {
          $match: {
            userId: ObjectId(user._id),
            parentId,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            userId: '$userId',
            name: '$name',
            type: '$type',
            isPublic: '$isPublic',
            parentId: '$parentId',
          },
        },
      ];

      const files = await dbClient.client
        .db()
        .collection('files')
        .aggregate(pipeline)
        .toArray();

      return response.status(200).send(files);
    }
    return response.status(401).send({ error: 'Unauthorized' });
  }

  static async putPublish(request, response) {
    const { 'x-token': token } = request.headers;
    const { id } = request.params;
    const user = await getUserFromToken(token);
    if (user !== null) {
      const file = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(user._id) });
      if (file !== null) {
        dbClient.client.db().collection('files').updateOne({ _id: ObjectId(id), userId: ObjectId(user._id) }, { $set: { isPublic: true } });
        const updatedFile = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(user._id) });
        return response.status(200).send({
          id: updatedFile._id,
          userId: updatedFile.userId,
          name: updatedFile.name,
          type: updatedFile.type,
          isPublic: updatedFile.isPublic,
          parentId: updatedFile.parentId,
        });
      }
      return response.status(404).send({ error: 'Not found' });
    }
    return response.status(401).send({ error: 'Unauthorized' });
  }

  static async putUnpublish(request, response) {
    const { 'x-token': token } = request.headers;
    const { id } = request.params;
    const user = await getUserFromToken(token);
    if (user !== null) {
      const file = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(user._id) });
      if (file !== null) {
        dbClient.client.db().collection('files').updateOne({ _id: ObjectId(id), userId: ObjectId(user._id) }, { $set: { isPublic: false } });
        const updatedFile = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(user._id) });
        return response.status(200).send({
          id: updatedFile._id,
          userId: updatedFile.userId,
          name: updatedFile.name,
          type: updatedFile.type,
          isPublic: updatedFile.isPublic,
          parentId: updatedFile.parentId,
        });
      }
      return response.status(404).send({ error: 'Not found' });
    }
    return response.status(401).send({ error: 'Unauthorized' });
  }

  static async getFile(request, response) {
    const { 'x-token': token } = request.headers;
    const { id } = request.params;
    const user = await getUserFromToken(token);
    if (user !== null) {
      const file = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(user._id) });
      if (file !== null && file.type === 'folder') {
        return response.status(400).send({ error: "A folder doesn't have content" });
      }
      if (file !== null && file.isPublic === true) {
        if (!fs.existsSync(file.localPath)) {
          return response.status(404).send({ error: 'Not found' });
        }
        const fileContent = fs.readFileSync(file.localPath);
        const mimeType = mime.lookup(file.name);
        response.setHeader('Content-Type', mimeType);
        response.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
        return response.send(fileContent);
      }
      return response.status(404).send({ error: 'Not found' });
    }
    return response.status(404).send({ error: 'Not found' });
  }
}

module.exports = FilesController;
