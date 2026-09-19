import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.js';
import apiRoutes from './src/routes/api.js';
import guildsRoutes from './src/routes/guilds.js';
import devRoutes from './src/routes/dev.js';
import publicRoutes from './src/routes/public.js';
import { connectMongo } from './src/services/mongo.js';

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api', apiRoutes);
app.use('/api/guilds', guildsRoutes);
app.use('/api/dev', devRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // A 4xx is this service telling a caller no, which is working as intended.
  // Only unexpected failures are worth a stack trace in the logs.
  if (!err.status || err.status >= 500) console.error(err);

  const body = { error: err.publicMessage || 'Internal server error' };
  // Field-level rejections from a config save, so the dashboard can mark the
  // offending control rather than showing one generic message.
  if (err.details) body.details = err.details;

  res.status(err.status || 500).json(body);
});

const port = process.env.PORT || 3000;

// Both databases are optional at boot. connectMongo() warns about whichever
// URI is missing rather than crashing the API over it: OAuth login and the
// public endpoints need no database at all, and routes that do need one
// answer 503 with a message saying which piece isn't configured. See
// src/services/mongo.js for what each database owns.
connectMongo()
  .catch((err) => console.error('MongoDB connection failed:', err))
  .finally(() => {
    app.listen(port, () => {
      console.log(`alice-api listening on :${port}`);
    });
  });
