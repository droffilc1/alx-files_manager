/* eslint-disable jest/lowercase-name */
/* eslint-disable  jest/prefer-expect-assertions */
/* eslint-disable  jest/no-test-callback */
/* eslint-disable no-undef */
/* eslint-disable jest/valid-expect */
/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable consistent-return */
import { tmpdir } from 'os';
import { join as joinPath } from 'path';
import {
  existsSync, readdirSync, unlinkSync, statSync,
} from 'fs';
import dbClient from '../../utils/db';

const DEFAULT_ROOT_FOLDER = 'default_folder_name';

describe('+ FilesController', () => {
  const baseDir = `${process.env.FOLDER_PATH || ''}`.trim().length > 0
    ? process.env.FOLDER_PATH.trim()
    : joinPath(tmpdir(), DEFAULT_ROOT_FOLDER);
  const mockUser = {
    email: 'katakuri@bigmom.com',
    password: 'mochi_mochi_whole_cake',
  };
  /**
   * 3 sample files
   * + 1 -> file
   * + 2 -> folder
   * + 3 -> file for file 2
   */
  const mockFiles = [
    {
      name: 'manga_titles.txt',
      type: 'file',
      data: [
        '+ Darwin\'s Game',
        '+ One Piece',
        '+ My Hero Academia',
        '',
      ].join('\n'),
      b64Data() { return Buffer.from(this.data, 'utf-8').toString('base64'); },
    },
    {
      name: 'One_Piece',
      type: 'folder',
      data: '',
      b64Data() { return ''; },
    },
    {
      name: 'chapter_titles.md',
      type: 'file',
      data: [
        '+ Chapter 47: The skies above the capital',
        '+ Chapter 48: 20 years',
        '+ Chapter 49: The world you wish for',
        '+ Chapter 50: Honor',
        '+ Chapter 51: The shogun of Wano - Kozuki Momonosuke',
        '+ Chapter 52: New morning',
        '',
      ].join('\n'),
      b64Data() { return Buffer.from(this.data, 'utf-8').toString('base64'); },
    },
  ];
  let token = '';
  const emptyFolder = (name) => {
    if (!existsSync(name)) {
      return;
    }
    for (const fileName of readdirSync(name)) {
      const filePath = joinPath(name, fileName);
      if (statSync(filePath).isFile) {
        unlinkSync(filePath);
      } else {
        emptyFolder(filePath);
      }
    }
  };
  const emptyDatabaseCollections = (callback) => {
    Promise.all([
      dbClient.db.collection('users'),
      dbClient.db.collection('files'),
    ])
      .then(([usersCollection, filesCollection]) => {
        Promise.all([usersCollection.deleteMany({}), filesCollection.deleteMany({})])
          .then(() => {
            if (callback) {
              callback();
            }
          })
          .catch((deleteErr) => done(deleteErr));
      }).catch((connectErr) => done(connectErr));
  };
  const signUp = (user, callback) => {
    request.post('/users')
      .send({ email: user.email, password: user.password })
      .expect(201)
      .end((requestErr, res) => {
        if (requestErr) {
          return callback ? callback(requestErr) : requestErr;
        }
        expect(res.body.email).to.eql(user.email);
        expect(res.body.id.length).to.be.greaterThan(0);
        if (callback) {
          callback();
        }
      });
  };
  const signIn = (user, callback) => {
    request.get('/connect')
      .auth(user.email, user.password, { type: 'basic' })
      .expect(200)
      .end((requestErr, res) => {
        if (requestErr) {
          return callback ? callback(requestErr) : requestErr;
        }
        expect(res.body.token).to.exist;
        expect(res.body.token.length).to.be.greaterThan(0);
        token = res.body.token;
        if (callback) {
          callback();
        }
      });
  };

  before(function (done) {
    this.timeout(10000);
    emptyDatabaseCollections(() => signUp(mockUser, () => signIn(mockUser, done)));
    emptyFolder(baseDir);
  });

  after(function (done) {
    this.timeout(10000);
    setTimeout(() => {
      emptyDatabaseCollections(done);
      emptyFolder(baseDir);
    });
  });

  describe('+ POST: /files', () => {
    it('+ Fails with no "X-Token" header field', function (done) {
      request.post('/files')
        .expect(401)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ error: 'Unauthorized' });
          done();
        });
    });

    it('+ Fails for a non-existent user', function (done) {
      this.timeout(5000);
      request.post('/files')
        .set('X-Token', 'raboof')
        .expect(401)
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr);
          }
          expect(res.body).to.deep.eql({ error: 'Unauthorized' });
          done();
        });
    });

    it('+ Fails if name is missing', function (done) {
      this.timeout(5000);
      request.post('/files')
        .set('X-Token', token)
        .send({})
        .expect(400)
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr);
          }
          expect(res.body).to.deep.eql({ error: 'Missing name' });
          done();
        });
    });

    it('+ Fails if type is missing', function (done) {
      this.timeout(5000);
      request.post('/files')
        .set('X-Token', token)
        .send({ name: 'manga_titles.txt' })
        .expect(400)
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr);
          }
          expect(res.body).to.deep.eql({ error: 'Missing type' });
          done();
        });
    });

    it('+ Fails if type is available but unrecognized', function (done) {
      this.timeout(5000);
      request.post('/files')
        .set('X-Token', token)
        .send({ name: 'manga_titles.txt', type: 'nakamura' })
        .expect(400)
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr);
          }
          expect(res.body).to.deep.eql({ error: 'Missing type' });
          done();
        });
    });

    it('+ Fails if data is missing and type is not a folder', function (done) {
      this.timeout(5000);
      request.post('/files')
        .set('X-Token', token)
        .send({ name: mockFiles[0].name, type: mockFiles[0].type })
        .expect(400)
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr);
          }
          expect(res.body).to.deep.eql({ error: 'Missing data' });
          done();
        });
    });

    it('+ Fails if unknown parentId is set', function (done) {
      this.timeout(5000);
      request.post('/files')
        .set('X-Token', token)
        .send({
          name: mockFiles[0].name,
          type: mockFiles[0].type,
          data: mockFiles[0].b64Data(),
          parentId: 55,
        })
        .expect(400)
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr);
          }
          expect(res.body).to.deep.eql({ error: 'Parent not found' });
          done();
        });
    });

    it('+ Succeeds for valid values of a file', function (done) {
      this.timeout(5000);
      request.post('/files')
        .set('X-Token', token)
        .send({
          name: mockFiles[0].name,
          type: mockFiles[0].type,
          data: mockFiles[0].b64Data(),
        })
        .expect(201)
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr);
          }
          expect(res.body.id).to.exist;
          expect(res.body.userId).to.exist;
          expect(res.body.name).to.eql(mockFiles[0].name);
          expect(res.body.type).to.eql(mockFiles[0].type);
          expect(res.body.isPublic).to.eql(false);
          expect(res.body.parentId).to.eql(0);
          mockFiles[0].id = res.body.id;
          done();
        });
    });

    it('+ Succeeds for valid values of a folder', function (done) {
      this.timeout(5000);
      request.post('/files')
        .set('X-Token', token)
        .send({
          name: mockFiles[1].name,
          type: mockFiles[1].type,
        })
        .expect(201)
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr);
          }
          expect(res.body.id).to.exist;
          expect(res.body.userId).to.exist;
          expect(res.body.name).to.eql(mockFiles[1].name);
          expect(res.body.type).to.eql(mockFiles[1].type);
          expect(res.body.isPublic).to.eql(false);
          expect(res.body.parentId).to.eql(0);
          mockFiles[1].id = res.body.id;
          done();
        });
    });

    it('+ Succeeds for valid values of a file inside a folder', function (done) {
      this.timeout(5000);
      request.post('/files')
        .set('X-Token', token)
        .send({
          name: mockFiles[2].name,
          type: mockFiles[2].type,
          data: mockFiles[2].b64Data(),
          parentId: mockFiles[1].id,
        })
        .expect(201)
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr);
          }
          expect(res.body.id).to.exist;
          expect(res.body.userId).to.exist;
          expect(res.body.name).to.eql(mockFiles[2].name);
          expect(res.body.type).to.eql(mockFiles[2].type);
          expect(res.body.isPublic).to.eql(false);
          expect(res.body.parentId).to.eql(mockFiles[1].id);
          mockFiles[2].id = res.body.id;
          done();
        });
    });
  });
});
