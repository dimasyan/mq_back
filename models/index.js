// models/index.js
import QuestionModel from './question.js';
import GameModel from './game.js';
import GameQuestionModel from './gameQuestion.js';
import UserModel from './user.js';
import MovieModel from './movie.js';
import Sequelize from 'sequelize';

const sequelize = new Sequelize(
  'music_quiz_db',
  'quiz_user',
  'password',
  {
    host: 'localhost',
    dialect: 'postgres',
  }
);

export const Question = QuestionModel(sequelize, Sequelize.DataTypes);
export const Game = GameModel(sequelize, Sequelize.DataTypes);
export const GameQuestion = GameQuestionModel(sequelize, Sequelize.DataTypes);
export const User = UserModel(sequelize, Sequelize.DataTypes);
export const Movie = MovieModel(sequelize, Sequelize.DataTypes);

const models = {
  Question,
  Game,
  GameQuestion,
  User,
  Movie,
};

// Set up associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

export default {
  ...models,
  sequelize,
  Sequelize
};
