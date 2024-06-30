import express from 'express';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';

export default function Routes(app) {
  const router = express.Router();
  router.use(express.json());
  app.use('/', router);

  // GET /status => AppController.getStatus
  router.get('/status', (req, res) => {
    AppController.getStatus(req, res);
  });

  // GET /stats => AppController.getStats
  router.get('/stats', (req, res) => {
    AppController.getStats(req, res);
  });

  // POST /users => UsersController.postNew
  router.post('/users', (req, res) => {
    UsersController.postNew(req, res);
  });

  // GET /users/me => UserController.getMe
  router.get('/users/me', (req, res) => {
    UsersController.getMe(req, res);
  });

  // GET /connect => AuthController.getConnect
  router.get('/connect', (req, res) => {
    AuthController.getConnect(req, res);
  });

  // GET /disconnect => AuthController.getDisconnect
  router.get('/disconnect', (req, res) => {
    AuthController.getDisconnect(res, res);
  });
}
