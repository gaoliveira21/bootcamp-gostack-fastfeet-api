import Sequelize from 'sequelize';

import dbConfig from '../config/database';

class Database {
  constructor() {
    this.postgres();
  }

  postgres() {
    this.connection = new Sequelize(dbConfig);
  }
}

export default new Database();
