'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('games', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending' // 'pending', 'finished'
      },
      score: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('games');
  }
};
