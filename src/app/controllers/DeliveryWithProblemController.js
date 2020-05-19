import { Op } from 'sequelize';

import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';
import File from '../models/File';
import Recipient from '../models/Recipient';

class DeliveryWithProblemController {
  async index(req, res) {
    const { page = 1, limit = 10 } = req.query;

    const DeliveriesWithProblem = await DeliveryProblem.findAll({
      order: [['delivery_id', 'ASC']],
      limit,
      offset: (page - 1) * limit,
      attributes: ['id', 'description'],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'product', 'start_date', 'end_date'],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: [
                'id',
                'name',
                'cep',
                'city',
                'street',
                'number',
                'complement',
              ],
            },
            {
              model: File,
              as: 'signature',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(DeliveriesWithProblem);
  }
}

export default new DeliveryWithProblemController();
