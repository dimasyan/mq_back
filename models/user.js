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
      tableName: 'users'
    }
  );
  return User;
};
