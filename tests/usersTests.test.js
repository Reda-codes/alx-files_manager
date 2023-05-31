/* eslint-disable jest/valid-expect */
const request = require('request');
const { expect } = require('chai');
const { v4: uuid } = require('uuid');

const app = 'http://localhost:5000';

describe('usersController Tests', () => {
  describe('postNew Test', () => {
    it('should create a new user and return status 201 with user details', () => new Promise((done) => {
      const id = uuid();
      const newUser = {
        email: `${id}@example.com`,
        password: '123123123',
      };

      request.post(`${app}/users`, { json: newUser }, (_err, res, body) => {
        expect(res.statusCode).to.be.equal(201);
        expect(body).to.have.property('id');
        expect(body).to.have.property('email').to.be.equal(newUser.email);
        done();
      });
    }));

    it('should return status 400 if email is missing', () => new Promise((done) => {
      const newUser = {
        password: 'password123',
      };

      request.post(`${app}/users`, { json: newUser }, (_err, res, body) => {
        expect(res.statusCode).to.be.equal(400);
        expect(body).to.have.property('error').to.be.equal('Missing email');
        done();
      });
    }));

    it('should return status 400 if password is missing', () => new Promise((done) => {
      const newUser = {
        email: 'test@example.com',
      };

      request.post(`${app}/users`, { json: newUser }, (_err, res, body) => {
        expect(res.statusCode).to.be.equal(400);
        expect(body).to.have.property('error').to.be.equal('Missing password');
        done();
      });
    }));

    it('should return status 400 if user already exists', () => new Promise((done) => {
      const existingUser = {
        email: 'bob@dylan.com',
        password: 'toto1234!',
      };

      request.post(`${app}/users`, { json: existingUser }, (_err, res, body) => {
        expect(res.statusCode).to.be.equal(400);
        expect(body).to.have.property('error').to.be.equal('Already exist');
        done();
      });
    }));
  });

  describe('getMe test', () => {
    it('should return the user details if the token is valid', () => new Promise((done) => {
      const connectHeaders = {
        authorization: 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=',
      };

      request.get(`${app}/connect`, { headers: connectHeaders }, (_err, res, body) => {
        expect(res.statusCode).to.be.equal(200);
        const { token } = JSON.parse(body);

        const getMeHeaders = {
          'x-token': token,
        };
        request.get(`${app}/users/me`, { headers: getMeHeaders }, (_err, res, body) => {
          expect(res.statusCode).to.be.equal(200);
          expect(JSON.parse(body)).to.have.property('id').that.is.a('string');
          expect(JSON.parse(body)).to.have.property('email').that.is.a('string');
          done();
        });
      });
    }));

    it('should return status 401 if the token is invalid or user is unauthorized', () => new Promise((done) => {
      const headers = {
        'x-token': '031bffac-3edc-4e51-aaae-1c121317da8a',
      };

      request.get(`${app}/users/me`, { headers }, (_err, res, body) => {
        expect(res.statusCode).to.be.equal(401);
        expect(JSON.parse(body)).to.have.property('error').to.be.equal('Unauthorized');
        done();
      });
    }));
  });
});
