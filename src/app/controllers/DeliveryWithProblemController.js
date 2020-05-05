import { Op } from 'sequelize';

import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';
import File from '../models/File';
import Recipient from '../models/Recipient';

class DeliveryWithProblemController {
  async index(req, res) {
    const { page = 1, limit = 10 } = req.query;

    const DeliveriesWithProblem = await DeliveryProblem.aggregate(
      'delivery_id',
      'DISTINCT',
      {
        plain: false,
        where: {
          delivery_id: { [Op.not]: null },
        },
      }
    );

    const ordersId = DeliveriesWithProblem.map(delivery => delivery.DISTINCT);

    const orders = await Order.findAll({
      where: {
        id: ordersId,
      },
      limit,
      offset: (page - 1) * limit,
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
    });

    return res.json(orders);
  }
}

export default new DeliveryWithProblemController();
