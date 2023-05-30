/* eslint-disable no-await-in-loop */
import { ObjectId } from 'mongodb';
import dbClient from './utils/db';

const Bull = require('bull');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');

const fileQueue = new Bull('fileQueue');
const userQueue = new Bull('userQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.client.db().collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

  if (!file) {
    throw new Error('File not found');
  }

  const thumbnailSizes = [500, 250, 100];

  for (const size of thumbnailSizes) {
    const options = { width: size };
    const thumbnailPath = `${file.localPath}_${size}`;
    const thumbnail = await imageThumbnail(file.localPath, options);
    await fs.promises.writeFile(thumbnailPath, thumbnail);
  }
});

userQueue.process(async (job) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const user = await dbClient.client.db().collection('users').findOne({ _id: ObjectId(userId) });

  if (!user) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${user.email}!`);
});
