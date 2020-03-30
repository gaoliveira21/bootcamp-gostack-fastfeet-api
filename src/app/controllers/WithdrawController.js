import { getDay, isWithinInterval, setHours } from 'date-fns';
import * as yup from 'yup';
import { Op } from 'sequelize';

import Order from '../models/Order';

class WithdrawController {
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
    });

    await schema
      .validate(req.params)
      .catch(err =>
        res.status(400).json({ error: err.name, details: err.errors })
      );

    const { deliveryId, id } = req.params;

    const order = await Order.findOne({
      where: { deliveryman_id: id, id: deliveryId, end_date: null },
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.start_date)
      return res.status(400).json({ error: 'Order already withdrawn' });

    const start_date = new Date();

    if (
      !isWithinInterval(start_date, {
        start: setHours(new Date(), 8),
        end: setHours(new Date(), 18),
      })
    )
      return res.status(401).json({
        error: 'Orders can only be withdraw between 08:00 and 18:00',
      });

    const ordersTaken = await Order.count({
      where: {
        start_date: {
          [Op.gte]: getDay(start_date),
        },
      },
    });

    if (ordersTaken === 5) {
      return res
        .status(401)
        .json({ error: 'Are permitted five withdrawals in a day' });
    }

    console.log(ordersTaken);

    await order.update({ start_date });

    return res.status(204).json();
  }
}

export default new WithdrawController();
