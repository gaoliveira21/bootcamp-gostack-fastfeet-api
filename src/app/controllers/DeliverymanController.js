import * as yup from 'yup';
import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const { page = 1, limit = 10, name = '' } = req.query;

    const deliverymen = await Deliveryman.findAll({
      where: {
        name: {
          [Op.like]: `${name}%`,
        },
      },
      limit,
      offset: (page - 1) * limit,
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: {
        model: File,
        as: 'avatar',
        attributes: ['id', 'name', 'path', 'url'],
      },
    });

    const totalRecords = await Deliveryman.count();
    const totalPages = Math.ceil(totalRecords / limit);

    return res.json({ deliverymen, totalRecords, totalPages });
  }

  async store(req, res) {
    const schema = yup.object().shape({
      name: yup.string().required(),
      email: yup
        .string()
        .email()
        .required(),
      avatar_id: yup.number().integer(),
    });

    await schema
      .validate(req.body)
      .catch(err =>
        res.status(400).json({ error: err.name, details: err.errors })
      );

    const { email, avatar_id } = req.body;

    const deliveryman = await Deliveryman.findOne({ where: { email } });

    // verify if have this email registered in database
    if (deliveryman)
      return res.status(400).json({ error: 'Deliveryman already exists' });

    // verify if avatar exists in database
    if (avatar_id) {
      const checkAvatarExists = await File.findByPk(avatar_id);

      if (!checkAvatarExists)
        return res
          .status(404)
          .json({ error: `Was not found a avatar file with id ${avatar_id}` });
    }

    const { id, name } = await Deliveryman.create(req.body);

    return res.status(201).json({ id, name, email, avatar_id });
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
        res.status(400).json({ error: err.name, details: err.errors })
      );

    if (!Object.keys(req.body).length)
      return res.status(400).json({ error: 'No request body sent' });

    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman)
      return res
        .status(404)
        .json({ error: `Was not found a deliveryman with id ${id}` });

    const { email, avatar_id } = req.body;

    if (email && email !== deliveryman.email) {
      const checkDeliveryman = await Deliveryman.findOne({ where: { email } });

      if (checkDeliveryman)
        return res.status(400).json({ error: 'Deliveryman already exists' });
    }

    if (avatar_id && avatar_id !== deliveryman.avatar_id) {
      const checkAvatarExists = await File.findByPk(avatar_id);

      if (!checkAvatarExists)
        return res
          .status(404)
          .json({ error: `Was not found a avatar file with id ${avatar_id}` });
    }

    const { name, email: currentEmail } = await deliveryman.update(req.body);

    return res.json({ id, name, email: currentEmail, avatar_id });
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

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({
        error: `Fails on remove deliveryman, was not found a deliveryman with id ${id}`,
      });
    }

    await deliveryman.destroy();

    return res.json({ msg: 'Deliveryman was removed', success: true });
  }
}

export default new DeliverymanController();
