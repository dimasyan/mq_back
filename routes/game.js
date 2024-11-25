// routes/game.js
import express from 'express';
import { Game, GameQuestion, Question, User } from '../models/index.js';
import Sequelize from 'sequelize';

const router = express.Router();

router.post('/newgame', async (req, res) => {
  try {
    const { tg_id, tg_username } = req.body;

    if (!tg_id) {
      return res.status(400).json({ message: 'tg_id is required' });
    }

    // Find or create the user
    let user = await User.findOne({ where: { tg_id } });
    if (!user) {
      user = await User.create({ tg_id, tg_username });
    }

    // Create a new game for the user
    const game = await Game.create({
      status: 'pending',
      score: 0,
      tg_id: user.tg_id
    });

    // Get random questions
    const questions = await Question.findAll({
      limit: 10,
      order: Sequelize.literal('RANDOM()'),
    });

    // Create game-question associations
    const gameQuestions = questions.map((question) => ({
      gameId: game.id,
      questionId: question.id,
    }));
    await GameQuestion.bulkCreate(gameQuestions);

    // Fetch the full game details including questions
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

    // Add the base URL to file paths
    const baseUrl = req.protocol + '://' + req.get('host');
    fullGame.GameQuestions.forEach((gq) => {
      if (gq.Question.file_path) {
        gq.Question.file_path = baseUrl + '/' + gq.Question.file_path;
      }
    });

    res.status(201).json({ message: 'New game created!', game: fullGame });
  } catch (error) {
    console.error('Error creating game:', error);
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

router.get('/leaderboard', async (req, res) => {
  try {
    const { tg_id } = req.query; // Assume tg_id is passed as a query parameter

    if (!tg_id) {
      return res.status(400).json({ message: 'tg_id is required' });
    }

    // Fetch top 20 users by score
    const top20 = await User.findAll({
      attributes: ['tg_id', 'tg_username', [Sequelize.literal('(SELECT SUM(score) FROM Games WHERE Games.tg_id = User.tg_id)'), 'total_score']],
      order: [[Sequelize.literal('total_score'), 'DESC']],
      limit: 20,
    });

    // Check if the requesting user is in the top 20
    const userInTop20 = top20.find((user) => user.tg_id === tg_id);

    if (userInTop20) {
      return res.status(200).json({ leaderboard: top20 });
    }

    // If not in top 20, find their rank
    const userRank = await User.findOne({
      attributes: [
        'tg_id',
        'tg_username',
        [Sequelize.literal('(SELECT SUM(score) FROM Games WHERE Games.tg_id = User.tg_id)'), 'total_score'],
        [
          Sequelize.literal(`(
            SELECT COUNT(*) + 1
            FROM Users AS u2
            WHERE (SELECT SUM(score) FROM Games WHERE Games.tg_id = u2.tg_id) > 
                  (SELECT SUM(score) FROM Games WHERE Games.tg_id = User.tg_id)
          )`),
          'rank',
        ],
      ],
      where: { tg_id },
    });

    // Include the user as the 21st entry
    const leaderboard = [...top20, userRank];

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard', error });
  }
});


export default router;
