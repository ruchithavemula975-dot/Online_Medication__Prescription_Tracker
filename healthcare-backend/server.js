import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authroutes.js';
import profileRoutes from './routes/profileroutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Healthcare API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT ||3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});