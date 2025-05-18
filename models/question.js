'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      // Define associations here
    }
  }
  Question.init(
    {
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      correct_answer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      genre: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      random_key: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Question',
      tableName: 'questions'
    }
  );
  return Question;
};
