// models/gameRegistration.js
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class GameRegistration extends Model {
  }

  GameRegistration.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      captainName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      teamName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      }
    },
    {
      sequelize,
      modelName: 'GameRegistration',
      tableName: 'game_registrations',
      timestamps: false, // Because you manually handle created_at and updated_at
    }
  );

  return GameRegistration;
};
