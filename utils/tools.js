const sha1 = require('sha1');

const hashPassword = (password) => sha1(password);

const userCredentials = (authorization) => {
  const base64 = authorization.slice(6);
  const buff = Buffer.from(base64, 'base64');
  const text = buff.toString('ascii');
  const credentials = text.split(':');
  return { email: credentials[0], password: hashPassword(credentials[1]) };
};

module.exports = {
  hashPassword,
  userCredentials,
};
