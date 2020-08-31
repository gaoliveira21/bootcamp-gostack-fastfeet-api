import Sequelize, { Model } from 'sequelize';
import randomNumber from '../helpers/randomNumber';

class Deliveryman extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        access_id: Sequelize.STRING,
      },
      { sequelize, tableName: 'deliverymen' }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  static async accessIdGenerate() {
    const access_id = randomNumber();

    const deliveryman = await this.findOne({ where: { access_id } });

    if (deliveryman) {
      this.accessIdGenerate();
    }

    return access_id;
  }
}

export default Deliveryman;
