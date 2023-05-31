/* eslint-disable jest/valid-expect */
const request = require('request');
const { expect } = require('chai');

const app = 'http://localhost:5000';

describe('authController Tests', () => {
  describe('getConnect test', () => {
    it('should return status 200 with a token if user is authorized', () => new Promise((done) => {
      const headers = {
        authorization: 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=',
      };

      request.get(`${app}/connect`, { headers }, (_err, res, body) => {
        expect(res.statusCode).to.be.equal(200);
        expect(JSON.parse(body)).to.have.property('token').that.is.a('string');
        done();
      });
    }));

    it('should return status 401 if user is unauthorized', () => new Promise((done) => {
      const headers = {
        authorization: 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCggtgthshE=',
      };

      request.get(`${app}/connect`, { headers }, (_err, res, body) => {
        expect(res.statusCode).to.be.equal(401);
        expect(JSON.parse(body)).to.have.property('error').that.is.equal('Unauthorized');
        done();
      });
    }));
  });

  describe('getDisconnect test', () => {
    it('should return status 204 if user is authorized and token is valid', () => new Promise((done) => {
      const connectHeaders = {
        authorization: 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=',
      };

      request.get(`${app}/connect`, { headers: connectHeaders }, (_err, res, body) => {
        expect(res.statusCode).to.be.equal(200);
        const { token } = JSON.parse(body);

        const disconnectHeaders = {
          'x-token': token,
        };

        request.get(`${app}/disconnect`, { headers: disconnectHeaders }, (_err, res) => {
          expect(res.statusCode).to.be.equal(204);
          done();
        });
      });
    }));

    it('should return status 401 if user is unauthorized or token is invalid', () => new Promise((done) => {
      const headers = {
        'x-token': '031bffac-3edc-4e51-aaae-1c121317da8a',
      };

      request.get(`${app}/disconnect`, { headers }, (_err, res, body) => {
        expect(res.statusCode).to.be.equal(401);
        expect(JSON.parse(body)).to.have.property('error').that.is.equal('Unauthorized');
        done();
      });
    }));
  });
});
