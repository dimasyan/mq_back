'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Movie extends Model {
    static associate(models) {
      // Define associations here
    }
  }
  Movie.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      kpId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      genres: {
        type: DataTypes.STRING, // Change to DataTypes.ARRAY(DataTypes.STRING) if you prefer array storage
        allowNull: true,
      },
      countries: {
        type: DataTypes.STRING, // Change to DataTypes.ARRAY(DataTypes.STRING) if you prefer array storage
        allowNull: true,
      },
      alternativeName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shortDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      slogan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      facts: {
        type: DataTypes.JSONB, // Use JSONB for structured data
        allowNull: true,
      },
      persons: {
        type: DataTypes.JSONB, // Use JSONB for structured data
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()'),
      },
    },
    {
      sequelize,
      modelName: 'Movie',
      tableName: 'movies'
    }
  );
  return Movie;
};
