/* eslint-disable jest/valid-expect */
const request = require('request');
const { expect } = require('chai');
const { v4: uuid } = require('uuid');

const app = 'http://localhost:5000';

describe('filesController tests', () => {
  it('should create a new file and return status 201 with file details', () => new Promise((done) => {
    const connectHeaders = {
      authorization: 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=',
    };

    request.get(`${app}/connect`, { headers: connectHeaders }, (_err, res, body) => {
      expect(res.statusCode).to.be.equal(200);
      const { token } = JSON.parse(body);

      const headers = {
        'x-token': token,
      };
      const id = uuid();
      const data = {
        name: `name-${id}.txt`,
        type: 'file',
        isPublic: true,
        data: 'Hello World',
      };
      request.post({ url: `${app}/files`, headers, json: data }, (_err, res, body) => {
        /* console.log(res.statusCode, body); */
        expect(res.statusCode).to.be.equal(201);
        expect(body).to.have.property('id').that.is.a('string');
        expect(body).to.have.property('userId').that.is.a('string');
        done();
      });
    });
  }));
});
