import * as yup from 'yup';
import { Op } from 'sequelize';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

import SendMail from '../jobs/SendMail';
import Queue from '../../lib/Queue';

class OrderController {
  async store(req, res) {
    const schema = yup.object().shape({
      product: yup.string().required(),
      recipient_id: yup
        .number()
        .positive()
        .required(),
      deliveryman_id: yup
        .number()
        .positive()
        .required(),
    });

    await schema
      .validate(req.body)
      .catch(err =>
        res.status(400).json({ error: err.name, details: err.errors })
      );

    const { deliveryman_id, recipient_id, product } = req.body;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id, {
      attributes: ['id', 'name', 'email'],
      include: {
        model: File,
        as: 'avatar',
        attributes: ['id', 'path', 'url'],
      },
    });

    if (!deliveryman)
      return res.status(404).json({ error: 'Deliveryman not found' });

    const recipient = await Recipient.findByPk(recipient_id, {
      attributes: [
        'id',
        'name',
        'cep',
        'city',
        'street',
        'number',
        'complement',
      ],
    });

    if (!recipient)
      return res.status(404).json({ error: 'Recipient not found' });

    const { id } = await Order.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    await Queue.add(SendMail.key, {
      deliveryman,
      recipient,
      product,
    });

    return res.status(201).json({
      order: {
        id,
        product,
        recipient,
        deliveryman,
      },
    });
  }

  async index(req, res) {
    const { page = 1, limit = 10, product = '' } = req.query;

    const orders = await Order.findAll({
      where: {
        product: {
          [Op.like]: `${product}%`,
        },
      },
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        },
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
            'state',
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    const totalRecords = await Order.count();
    const totalPages = Math.ceil(totalRecords / limit);

    return res.json({ orders, totalRecords, totalPages });
  }

  async update(req, res) {
    const schema = yup.object().shape({
      id: yup
        .number()
        .positive()
        .required(),
    });

    await schema
      .validate(req.params)
      .catch(err =>
        res.status(400).json({ error: err.names, details: err.errors })
      );

    if (!Object.keys(req.body).length)
      return res.status(400).json({ error: 'No request body sent' });

    const { id } = req.params;
    const order = await Order.findByPk(id);

    if (!order)
      return res
        .status(404)
        .json({ error: `Was not found an order with id ${id}` });

    const { deliveryman_id, recipient_id, product } = req.body;

    if (deliveryman_id && deliveryman_id !== order.deliveryman_id) {
      const deliveryman = await Deliveryman.findByPk(deliveryman_id);

      if (!deliveryman)
        return res.status(404).json({
          error: `Was not found a deliveryman with id ${deliveryman_id}`,
        });
    }

    if (recipient_id && recipient_id !== order.recipient_id) {
      const recipient = await Recipient.findByPk(recipient_id);

      if (!recipient)
        return res.status(404).json({
          error: `Was not found a recipient with id ${recipient_id}`,
        });
    }

    const updatedOrder = await order.update({
      recipient_id,
      deliveryman_id,
      product,
    });

    return res.json(updatedOrder);
  }

  async delete(req, res) {
    const schema = yup.object().shape({
      id: yup
        .number()
        .positive()
        .required(),
    });

    await schema
      .validate(req.params)
      .catch(err =>
        res.status(400).json({ error: err.name, details: err.errors })
      );

    const { id } = req.params;

    const order = await Order.findByPk(id);

    if (!order)
      res.status(404).json({
        error: `Fails on remove order, was not found an order with id ${id}`,
      });

    await order.destroy();

    return res.json({ msg: 'Order was removed', success: true });
  }
}

export default new OrderController();
