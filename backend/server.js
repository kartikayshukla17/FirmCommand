import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import inviteRoutes from './routes/invites.js';
import organizationRoutes from './routes/organization.js';
import notificationRoutes from './routes/notifications.js';
import errorHandler from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import { createServer } from 'http';
import { initSocket } from './utils/socket.js';

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cookieParser()); // Parse cookies
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    credentials: true // Allow cookies
}));

// Initialize Socket.io
initSocket(httpServer);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('connected to db'))
    .catch((err) => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('Legal Task Manager API is Running');
});

// Error Handler (must be last middleware)
app.use(errorHandler);

const server = httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
