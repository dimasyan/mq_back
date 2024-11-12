// routes/game.js
import express from 'express';
import { Game, GameQuestion, Question } from '../models/index.js';
import Sequelize from 'sequelize'; // Ensure you import this as needed for random ordering of questions
import path from 'path';

const router = express.Router();

router.post('/newgame', async (req, res) => {
  try {
    const game = await Game.create({ status: 'pending', score: 0 });

    const questions = await Question.findAll({
      limit: 10,
      order: Sequelize.literal('RANDOM()'),
    });

    const gameQuestions = questions.map((question) => ({
      gameId: game.id,
      questionId: question.id,
    }));

    console.log('Game Questions:', gameQuestions);

    await GameQuestion.bulkCreate(gameQuestions);

    const fullGame = await Game.findOne({
      where: { id: game.id },
      include: {
        model: GameQuestion,
        include: {
          model: Question,
          attributes: ['id', 'text', 'correct_answer', 'file_path'],
        },
      },
    });

    const baseUrl = req.protocol + '://' + req.get('host');
    fullGame.GameQuestions.forEach((gq) => {
      if (gq.Question.file_path) {
        gq.Question.file_path = baseUrl + '/' + gq.Question.file_path;
      }
    });

    res.status(201).json({ message: 'New game created!', game: fullGame });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error creating game', error });
  }
});

router.post('/endgame', async (req, res) => {
  try {
    console.log('Endgame req ', req.body)
    const { gameId, score } = req.body;

    // Find the game by its ID
    const game = await Game.findOne({ where: { id: gameId } });

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Update the game status to 'finished' and the score
    game.status = 'finished';
    game.score = score;
    await game.save();

    res.status(200).json({ message: 'Game finished!', game });
  } catch (error) {
    console.error('Error finishing game:', error);
    res.status(500).json({ message: 'Error finishing game', error });
  }
});

export default router;
