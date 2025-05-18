import cron from 'node-cron';
import { sequelize } from '../models/index.js'; // adjust the import path if needed

const updateRandomKeys = async () => {
  try {
    await sequelize.query(`
      UPDATE questions
      SET random_key = RANDOM();
    `);
    console.log(`[${new Date().toISOString()}] random_key updated for all questions`);
  } catch (error) {
    console.error('Error in random_key update:', error);
  }
};

// Run every 30 minutes
cron.schedule('*/30 * * * *', () => {
  updateRandomKeys();
});

export default updateRandomKeys;
