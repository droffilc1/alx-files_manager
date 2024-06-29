import express from 'express';
import AppController from '../controllers/AppController';
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
}
