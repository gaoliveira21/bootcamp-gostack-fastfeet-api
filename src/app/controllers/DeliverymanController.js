import * as yup from 'yup';
import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
  async index(req, res) {
    const { page = 1, limit = 10 } = req.query;

    const deliverymen = await Deliveryman.findAll({
      limit,
      offset: (page - 1) * limit,
    });

    return res.json(deliverymen);
  }

  async store(req, res) {
    const schema = yup.object().shape({
      name: yup.string().required(),
      email: yup
        .string()
        .email()
        .required(),
    });

    await schema
      .validate(req.body)
      .catch(err =>
        res.status(400).json({ error: err.name, details: err.errors })
      );

    const { email } = req.body;

    const deliveryman = await Deliveryman.findOne({ where: { email } });

    if (deliveryman)
      return res.status(400).json({ error: 'Deliveryman already exists' });

    const { id, name } = await Deliveryman.create(req.body);

    return res.status(201).json({ id, name, email });
  }

  async update(req, res) {
    if (!Object.keys(req.body).length)
      return res.status(400).json({ error: 'No request body sent' });

    const deliveryman = await Deliveryman.findByPk(req.params.id);

    const { email } = req.body;

    if (email && email !== deliveryman.email) {
      const checkDeliveryman = await Deliveryman.findOne({ where: { email } });

      if (checkDeliveryman)
        return res.status(400).json({ error: 'Deliveryman already exists' });
    }

    const { id, name, email: currentEmail } = await deliveryman.update(
      req.body
    );

    return res.json({ id, name, email: currentEmail });
  }
}

export default new DeliverymanController();
