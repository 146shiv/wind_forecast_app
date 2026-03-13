import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import windRoutes from './routes/windRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint for monitoring.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/v1/wind', windRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  // Fail fast if Mongo connection string is missing.
  console.error('MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

// mongoose
//   .connect(MONGO_URI, {
    
//   })
//   .then(() => {
//     console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
//   })
//   .catch((err) => {
//     console.error('Failed to connect to MongoDB:', err.message);
//     process.exit(1);
//   });

