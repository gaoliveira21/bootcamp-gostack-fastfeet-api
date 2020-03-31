import * as yup from 'yup';
import { Op } from 'sequelize';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';
import DeliveryProblem from '../models/DeliveryProblem';

class DeliveryController {
  async index(req, res) {
    const { page = 1, limit = 10, delivered = false } = req.query;

    const schema = yup.object().shape({
      id: yup
        .number()
        .positive()
        .required(),
    });

    await schema
      .validate(req.params)
      .catch(err => res.json({ error: err.name, details: err.errors }));

    const { id: deliverymanId } = req.params;

    const deliveryman = await Deliveryman.findByPk(deliverymanId);

    if (!deliveryman)
      return res.status(404).json({
        error: `Was not found a deliveryman with id ${deliverymanId}`,
      });

    const filter = {
      deliveryman_id: deliverymanId,
      canceled_at: null,
      end_date: { [Op.not]: null },
    };

    if (String(delivered) === 'false') filter.end_date = null;

    const orders = await Order.findAll({
      where: filter,
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
        { model: File, as: 'signature', attributes: ['id', 'path', 'url'] },
      ],
    });

    return res.json(orders);
  }

  async delete(req, res) {
    const schema = yup.object().shape({
      id: yup
        .number()
        .positive()
        .required(),
    });

    await schema.validate(req.params).catch(err =>
      res.status(400).json({
        error: err.name,
        details: err.errors,
      })
    );

    const { id } = req.params;

    const problem = await DeliveryProblem.findByPk(id);

    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const { delivery_id } = problem;

    const order = await Order.findByPk(delivery_id);

    await order.update({ canceled_at: new Date() });

    return res.json(order);
  }
}

export default new DeliveryController();
