/* eslint-disable jest/valid-expect */
const request = require('request');
const { expect } = require('chai');

const app = 'http://localhost:5000';

describe('appController tests', () => {
  describe('getStatus Test', () => {
    it('should return status 200 with redis and mongo status', () => new Promise((done) => {
      request.get(`${app}/status`, (_err, res, body) => {
        expect(res.statusCode).to.be.equal(200);
        expect(JSON.parse(body)).to.have.property('redis').that.is.a('boolean');
        expect(JSON.parse(body)).to.have.property('db').that.is.a('boolean');
        done();
      });
    }));
  });

  describe('getStats Test', () => {
    it('should return stats 200 with user and file counts', () => new Promise((done) => {
      request.get(`${app}/stats`, (_err, res, body) => {
        expect(res.statusCode).to.be.equal(200);
        expect(JSON.parse(body)).to.have.property('users').that.is.a('number');
        expect(JSON.parse(body)).to.have.property('files').that.is.a('number');
        done();
      });
    }));
  });
});
