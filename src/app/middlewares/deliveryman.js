import jwt from 'jsonwebtoken';
import Deliveryman from '../models/Deliveryman';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const { access_id } = req.body;

  if (!access_id) {
    return next();
  }

  const deliveryman = await Deliveryman.findOne({
    where: { access_id },
    attributes: ['id', 'name', 'email', 'avatar_id'],
  });

  if (!deliveryman) {
    return res.status(400).json({ error: 'Invalid access id' });
  }

  const token = jwt.sign({ id: deliveryman.id }, authConfig.secret, {
    expiresIn: '7d',
  });

  return res.status(201).json({ token, deliveryman });
};
