import fs from "fs";
import express from "express";
import {fileURLToPath} from "url";
import cors from "cors";
import { dirname, join } from 'path';
import gameRoutes from "./routes/game.js"
import * as https from "https";
import pkg from 'pg';
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
const httpsPort = 3000;
app.use(cors({
  origin: '*', // Allow all origins
}))

// PostgreSQL connection setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/output', express.static(join(__dirname, 'output')));
app.use('/api', gameRoutes);

if (process.env.NODE_ENV === 'prod') {
  const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/izzyquiz.kz/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/izzyquiz.kz/fullchain.pem')
  };

  https.createServer(httpsOptions, app).listen(httpsPort, '0.0.0.0', () => {
    console.log(`Server is running on https://localhost:${httpsPort}`);
  })
} else {
  app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`);
  });
}
