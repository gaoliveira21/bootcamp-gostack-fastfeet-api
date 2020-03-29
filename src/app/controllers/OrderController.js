import * as yup from 'yup';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

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

    const { deliveryman_id, recipient_id } = req.body;

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

    const { product } = await Order.create(req.body);

    return res.json({
      order: {
        product,
        recipient,
        deliveryman,
      },
    });
  }
}

export default new OrderController();
