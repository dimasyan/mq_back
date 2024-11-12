const { Pool } = require('pg');

const pool = new Pool({
  user: 'quiz_user',
  host: 'localhost',
  database: 'music_quiz_db',
  password: 'password',
  port: 5432,
});

module.exports = pool;
