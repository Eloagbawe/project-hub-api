import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import projectRouter from './routes/projectRoutes.js';

const port = process.env.PORT || 8080;

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/projects', projectRouter);

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
})
