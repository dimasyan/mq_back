// models/GameQuestion.js
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class GameQuestion extends Model {
    static associate(models) {
      GameQuestion.belongsTo(models.Game, { foreignKey: 'gameId' });
      GameQuestion.belongsTo(models.Question, { foreignKey: 'questionId' });
    }
  }

  GameQuestion.init({
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Ensure that gameId cannot be null
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Ensure that questionId cannot be null
    },
  }, {
    sequelize,
    modelName: 'GameQuestion',
    tableName: 'game_questions'
  });

  return GameQuestion;
};
