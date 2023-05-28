const sha1 = require('sha1');

const hashPassword = (password) => sha1(password);

module.exports = {
  hashPassword,
};
