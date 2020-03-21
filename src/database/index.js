import Sequelize from 'sequelize';

import dbConfig from '../config/database';

import User from '../app/models/User';
import Recipient from '../app/models/Recipient';

const models = [User, Recipient];

class Database {
  constructor() {
    this.postgres();
  }

  postgres() {
    this.connection = new Sequelize(dbConfig);
    models.map(model => model.init(this.connection));
  }
}

export default new Database();
