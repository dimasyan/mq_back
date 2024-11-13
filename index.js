import express from 'express';
import pkg from 'pg';
import gameRoutes from './routes/game.js';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pkg;

const app = express();
const port = 3000;

app.use(cors({
  origin: '*', // Allow all origins
}))

// PostgreSQL connection setup
const pool = new Pool({
  user: 'quiz_user',
  host: 'localhost',
  database: 'music_quiz_db',
  password: 'password',
  port: 5432
});

app.use(express.json());
app.get('/', (req, res) => {
  res.send('Music Quiz Backend Service');
});

// Test DB connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Database connected successfully: ${result.rows[0].now}`);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/output', express.static(join(__dirname, 'output')));
app.use('/api', gameRoutes);

app.listen(port,() => {
  console.log(`Server is running on http://localhost:${port}`);
});
