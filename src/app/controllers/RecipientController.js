import * as yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
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
}

export default new RecipientController();
