import * as yup from 'yup';
import jwt from 'jsonwebtoken';

import authConfig from '../../config/auth';

import User from '../models/User';

class SessionController {
  async store(req, res) {
    const schema = yup.object().shape({
      email: yup
        .string()
        .email()
        .required(),
      password: yup.string().required(),
    });

    await schema
      .validate(req.body)
      .catch(err =>
        res.status(400).json({ error: err.name, details: err.errors })
      );

    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!(await user.checkPassword(password)))
      return res.status(400).json({ error: 'Password does not match' });

    // token generate
    const token = jwt.sign({ id: user.id }, authConfig.secret, {
      expiresIn: '7d',
    });

    const { id, name } = user;

    return res.status(201).json({ id, name, email, token });
  }
}

export default new SessionController();
