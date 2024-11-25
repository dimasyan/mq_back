// models/Game.js
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Game extends Model {
    static associate(models) {
      Game.hasMany(models.GameQuestion, { foreignKey: 'gameId' });
      Game.belongsTo(models.Game, { foreignKey: 'tg_id', targetKey: 'tg_id', })
    }
  }

  Game.init({
    status: DataTypes.STRING,
    score: DataTypes.INTEGER,
    tg_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Game',
    tableName: 'games'
  });

  return Game;
};
