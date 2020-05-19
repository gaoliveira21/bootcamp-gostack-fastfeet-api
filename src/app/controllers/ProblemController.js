import * as yup from 'yup';

import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';

class ProblemController {
  async index(req, res) {
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

    const problems = await DeliveryProblem.findAll({
      where: {
        delivery_id: id,
      },
      attributes: ['id', 'description', 'delivery_id'],
    });

    if (!problems)
      return res
        .status(404)
        .json({ error: 'Was not found problems for this order' });

    return res.json(problems);
  }

  async store(req, res) {
    const schema = yup.object().shape({
      description: yup.string().required(),
      id: yup
        .number()
        .positive()
        .required(),
    });

    const data = Object.assign(req.body, req.params);

    await schema.validate(data).catch(err =>
      res.status(400).json({
        error: err.name,
        details: err.errors,
      })
    );

    const { id, description } = data;

    const order = await Order.findByPk(id);

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const problem = await DeliveryProblem.create({
      description,
      delivery_id: order.id,
    });

    return res.status(201).json(problem);
  }
}

export default new ProblemController();
