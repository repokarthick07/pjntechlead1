import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import router from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', app: 'PJN LEADFLOW Backend', timestamp: new Date() });
});

// API Routes
app.use('/api', router);

// Error Handler Middleware
app.use(errorHandler);

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 PJN LEADFLOW Backend running on port http://0.0.0.0:${PORT}`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by an existing backend process.`);
    console.error(`💡 Note: The backend service is ALREADY running at http://localhost:${PORT}`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

