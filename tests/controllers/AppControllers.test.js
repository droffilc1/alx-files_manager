/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/prefer-expect-assertions */
/* eslint-disable jest/no-test-callback */
/* eslint-disable no-undef */
/* eslint-disable jest/valid-expect */
/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable consistent-return */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import dbClient from '../../utils/db';

let mongoServer;
let client;

before(async function () {
  this.timeout(10000);
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const db = client.db('test');

  dbClient.db = db;

  await Promise.all([
    db.collection('users').deleteMany({}),
    db.collection('files').deleteMany({}),
  ]);
});

after(async () => {
  await client.close();
  await mongoServer.stop();
});

describe('+ AppController', () => {
  describe('+ GET: /status', () => {
    it('+ Services are online', function (done) {
      request.get('/status')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ redis: true, db: true });
          done();
        });
    });
  });

  describe('+ GET: /stats', () => {
    it('+ Correct statistics about db collections', function (done) {
      request.get('/stats')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ users: 0, files: 0 });
          done();
        });
    });

    it('+ Correct statistics about db collections [alt]', function (done) {
      this.timeout(10000);
      const usersCollection = dbClient.db.collection('users');
      const filesCollection = dbClient.db.collection('files');

      Promise.all([
        usersCollection.insertMany([{ email: 'john@mail.com' }]),
        filesCollection.insertMany([
          { name: 'foo.txt', type: 'file' },
          { name: 'pic.png', type: 'image' },
        ]),
      ])
        .then(() => {
          request.get('/stats')
            .expect(200)
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res.body).to.deep.eql({ users: 1, files: 2 });
              done();
            });
        })
        .catch((err) => done(err));
    });
  });
});
