import fs from "fs";
import express from "express";
import {fileURLToPath} from "url";
import cors from "cors";
import { dirname, join } from 'path';
import gameRoutes from "./routes/game.js"
import * as https from "https";
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
const httpsPort = 3000;
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

const httpsOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/dimashbratan.kz/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/dimashbratan.kz/fullchain.pem')
};

https.createServer(httpsOptions, app).listen(httpsPort, () => {
  console.log(`Server is running on https://localhost:${httpsPort}`);
})
