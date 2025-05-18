'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('questions', 'random_key', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    // Create an index on 'random_key'
    await queryInterface.addIndex('questions', ['random_key'], {
      name: 'idx_questions_random_key',
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeIndex('questions', 'idx_questions_random_key');
    await queryInterface.removeColumn('questions', 'random_key');
  }
};
