import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';
import OrderController from './app/controllers/OrderController';
import DeliveryController from './app/controllers/DeliveryController';
import WithdrawController from './app/controllers/WithdrawController';
import FinishController from './app/controllers/FinishController';
import Problem from './app/controllers/ProblemController';
import DeliveryWithProblemController from './app/controllers/DeliveryWithProblemController';

import authMiddleware from './app/middlewares/auth';
import deliverymanMiddleware from './app/middlewares/deliveryman';

const routes = new Router();
const uploads = multer(multerConfig);

routes.post('/sessions', deliverymanMiddleware, SessionController.store);

routes.get('/deliveryman/:id/deliveries', DeliveryController.index);
routes.post(
  '/deliveryman/:id/deliveries/:deliveryId/withdraw',
  WithdrawController.store
);
routes.post(
  '/deliveryman/:id/deliveries/:deliveryId/finish',
  FinishController.store
);

routes.post('/delivery/:id/problems', Problem.store);

routes.use(authMiddleware);

routes.get('/delivery/:id/problems', Problem.index);
routes.delete('/problem/:id/cancel-delivery', DeliveryController.delete);

routes.get('/delivery/problems', DeliveryWithProblemController.index);

routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);

routes.get('/deliverymen', DeliverymanController.index);
routes.post('/deliverymen', DeliverymanController.store);
routes.put('/deliverymen/:id', DeliverymanController.update);
routes.delete('/deliverymen/:id', DeliverymanController.delete);

routes.post('/orders', OrderController.store);
routes.get('/orders', OrderController.index);
routes.put('/orders/:id', OrderController.update);
routes.delete('/orders/:id', OrderController.delete);

routes.post('/files', uploads.single('files'), FileController.store);

export default routes;
