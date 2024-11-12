'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('game_questions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      gameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'games',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      questionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'questions',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('game_questions');
  }
};
