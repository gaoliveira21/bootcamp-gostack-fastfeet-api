import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';
import File from '../models/File';
import Recipient from '../models/Recipient';

class DeliveryWithProblemController {
  async index(req, res) {
    const { page = 1, limit = 10 } = req.query;

    const problems = await DeliveryProblem.findAll({
      order: [['created_at', 'DESC']],
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

    const totalRecords = await DeliveryProblem.count();
    const totalPages = Math.ceil(totalRecords / limit);

    return res.json({ problems, totalRecords, totalPages });
  }
}

export default new DeliveryWithProblemController();
