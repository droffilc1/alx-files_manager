/* eslint-disable jest/lowercase-name */
/* eslint-disable  jest/prefer-expect-assertions */
/* eslint-disable  jest/no-test-callback */
/* eslint-disable no-undef */
/* eslint-disable jest/valid-expect */
/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable consistent-return */
import dbClient from '../../utils/db';

describe('+ UserController', () => {
  const mockUser = {
    email: 'test@test.com',
    password: 'test123',
  };

  before(function (done) {
    this.timeout(10000);
    dbClient.db.collection('users')
      .deleteMany({ email: mockUser.email })
      .then(() => done())
      .catch((deleteErr) => done(deleteErr));
  });

  describe('+ POST: /users', () => {
    it('+ Fails when there is no email and there is password', function (done) {
      this.timeout(5000);
      request.post('/users')
        .send({
          password: mockUser.password,
        })
        .expect(400)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ error: 'Missing email' });
          done();
        });
    });

    it('+ Fails when there is email and there is no password', function (done) {
      this.timeout(5000);
      request.post('/users')
        .send({
          email: mockUser.email,
        })
        .expect(400)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ error: 'Missing password' });
          done();
        });
    });

    it('+ Succeeds when the new user has a password and email', function (done) {
      this.timeout(5000);
      request.post('/users')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.email).to.eql(mockUser.email);
          expect(res.body.id.length).to.be.greaterThan(0);
          done();
        });
    });

    it('+ Fails when the user already exists', function (done) {
      this.timeout(5000);
      request.post('/users')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        })
        .expect(400)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ error: 'Already exist' });
          done();
        });
    });
  });
});
