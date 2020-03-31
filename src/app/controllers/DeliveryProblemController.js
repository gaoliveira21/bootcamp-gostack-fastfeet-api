import * as yup from 'yup';

import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';

class DeliveryProblemController {
  async index(req, res) {
    const { page = 1, limit = 10 } = req.query;

    const problems = await DeliveryProblem.findAll({
      limit,
      offset: (page - 1) * limit,
      include: {
        model: Order,
        as: 'order',
      },
    });

    const orders = problems.map(problem => problem.order);

    return res.json(orders);
  }

  async show(req, res) {
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
      attributes: ['id', 'description'],
    });

    if (!problems)
      return res
        .status(404)
        .json({ error: 'Was not found problems for this order' });

    return res.json(problems);
  }
}

export default new DeliveryProblemController();
