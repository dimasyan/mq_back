'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations here
    }
  }
  User.init(
    {
      tg_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tg_username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true, // Enables createdAt and updatedAt
      createdAt: 'created_at', // Map Sequelize's `createdAt` to `created_at`
      updatedAt: 'updated_at',
    }
  );
  return User;
};
