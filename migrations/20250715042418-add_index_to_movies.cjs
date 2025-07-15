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
    await queryInterface.addColumn('movies', 'random_key', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    // Create an index on 'random_key'
    await queryInterface.addIndex('movies', ['random_key'], {
      name: 'idx_movies_random_key',
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeIndex('movies', 'idx_movies_random_key');
    await queryInterface.removeColumn('movies', 'random_key');
  }
};
