import * as yup from 'yup';
import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const { page = 1, limit = 10, name = '' } = req.query;

    const recipient = await Recipient.findAll({
      where: {
        name: {
          [Op.like]: `${name}%`,
        },
      },
      limit,
      offset: (page - 1) * limit,
      attributes: [
        'id',
        'name',
        'street',
        'number',
        'complement',
        'state',
        'city',
        'cep',
      ],
    });

    return res.json(recipient);
  }

  async store(req, res) {
    const schema = yup.object().shape({
      name: yup.string().required(),
      street: yup.string().required(),
      number: yup.string().required(),
      complement: yup.string(),
      state: yup.string().required(),
      city: yup.string().required(),
      cep: yup.string().required(),
    });

    await schema
      .validate(req.body)
      .catch(err =>
        res.status(400).json({ error: err.name, details: err.errors })
      );

    const recipient = await Recipient.create(req.body);

    return res.status(201).json(recipient);
  }

  async update(req, res) {
    if (!Object.keys(req.body).length)
      return res.status(400).json({ error: 'No request body sent' });

    const recipient = await Recipient.findByPk(req.params.id);

    const {
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
      cep,
    } = await recipient.update(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
      cep,
    });
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

    const recipient = await Recipient.findByPk(id);

    if (!recipient)
      return res.status(404).json({ error: 'Recipient not found' });

    recipient.destroy();

    return res.status(204).json();
  }
}

export default new RecipientController();
