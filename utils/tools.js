import { ObjectId } from 'mongodb';
import dbClient from './db';
import redisClient from './redis';

const sha1 = require('sha1');

const hashPassword = (password) => sha1(password);

const userCredentials = (authorization) => {
  const base64 = authorization.slice(6);
  const buff = Buffer.from(base64, 'base64');
  const text = buff.toString('ascii');
  const credentials = text.split(':');
  return { email: credentials[0], password: hashPassword(credentials[1]) };
};

const getUserFromToken = async (token) => {
  const userId = await redisClient.get(`auth_${token}`);
  if (userId) {
    const user = await dbClient.client.db().collection('users').findOne({ _id: ObjectId(userId) });
    if (user !== null) {
      return user;
    }
    return null;
  }
  return null;
};

const getUserFromHeader = async (header) => {
  const { email, password } = userCredentials(header);
  const user = await dbClient.client.db().collection('users').findOne({ email, password });
  if (user !== null) {
    return user;
  }
  return null;
};

module.exports = {
  hashPassword,
  userCredentials,
  getUserFromToken,
  getUserFromHeader,
};
