import * as yup from 'yup';
import { Op } from 'sequelize';

import Order from '../models/Order';
import File from '../models/File';

class FinishController {
  async store(req, res) {
    const schema = yup.object().shape({
      id: yup
        .number()
        .positive()
        .required(),
      deliveryId: yup
        .number()
        .positive()
        .required(),
      signature_id: yup
        .number()
        .positive()
        .required(),
    });

    const data = Object.assign(req.body, req.params);

    await schema
      .validate(data)
      .catch(err =>
        res.status(400).json({ error: err.name, details: err.errors })
      );

    const { deliveryId, id, signature_id } = data;

    const order = await Order.findOne({
      where: {
        deliveryman_id: id,
        id: deliveryId,
        end_date: null,
        start_date: { [Op.not]: null },
      },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const file = await File.findByPk(signature_id);

    if (!file) return res.status(404).json({ error: 'File not found' });

    const end_date = new Date();

    await order.update({ end_date, signature_id });

    return res.status(204).json();
  }
}

export default new FinishController();
