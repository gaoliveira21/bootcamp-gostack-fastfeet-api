module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('deliverymen', 'access_id', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('deliverymen', 'access_id');
  },
};
