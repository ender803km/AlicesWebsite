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
  console.error(err);
  res.status(err.status || 500).json({ error: err.publicMessage || 'Internal server error' });
});

const port = process.env.PORT || 3000;

// Mongo is optional at boot — connectMongo() logs a warning and returns
// null if MONGODB_URI isn't set yet, rather than crashing the whole API
// over a feature (guild config) that isn't wired up on Railway yet.
connectMongo()
  .catch((err) => console.error('MongoDB connection failed:', err))
  .finally(() => {
    app.listen(port, () => {
      console.log(`alice-api listening on :${port}`);
    });
  });
