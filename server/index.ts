import express from 'express';
import cors from 'cors';
import scheduleRouter from './routes/schedule';
import executorRouter from './routes/executor';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API Routes
app.use('/api/schedule', scheduleRouter);
app.use('/api/executor', executorRouter);

app.listen(port, () => {
  console.log(`Express server running on http://localhost:${port}`);
});
