import 'express-async-errors'; // Lets Express catch errors thrown in async route handlers instead of crashing the server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import authRoutes from '../auth/auth.js'; // Import the auth router
import fypRoutes from '../foryou/fyp_backend.js'; // Import the fyp router
import userRoutes from '../user/user_backend.js'; // Import the user router
import cabinetRoutes, { uploadDir, compressedUploadDir } from '../cabinet/cabinet_backend.js'; // Import the cabinet router
import discoveryRoutes from '../discovery/discovery_backend.js'; // Import the discovery router

dotenv.config({ path: '../../../.env' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Behind a hosting proxy (e.g. Railway), trust it so req.protocol is 'https' and image URLs are built correctly:
app.set('trust proxy', 1);

const allowedOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_URL_DEVELOPMENT].filter(Boolean);

// Middleware
app.use(cors((req, callback) => {
    const origin = req.header('Origin');
    // Requests from the same site (the frontend served by this server) are always allowed:
    const sameOrigin = origin === `${req.protocol}://${req.get('host')}`;
    callback(null, {
        origin: !origin || sameOrigin || allowedOrigins.includes(origin),
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    });
}));
app.use(express.json());

// Uploaded images (same folders the cabinet router saves them to):
app.use('/uploads', express.static(uploadDir));
app.use('/compressed', express.static(compressedUploadDir));

// Health check for the host and CI: confirms the server is up and the database answers.
app.get('/api/health', async (req, res) => {
    await db.query('SELECT 1');
    res.json({ success: true, status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/fyp', fypRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cabinet', cabinetRoutes);
app.use('/api/discovery', discoveryRoutes);

// Serve the built React app (frontend/build) from the same origin as the API, if it has been built:
const frontendBuildDir = path.join(__dirname, '../../../frontend/build');
if (fs.existsSync(frontendBuildDir)) {
    app.use(express.static(frontendBuildDir));
    app.get(/^\/(?!api\/|uploads\/|compressed\/).*/, (req, res) => {
        res.sendFile(path.join(frontendBuildDir, 'index.html'));
    });
}

// Any error that reaches here gets a 500 response instead of taking the server down:
app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

// Background tasks (e.g. the hourly expired-token cleanup) shouldn't crash the server if the database is briefly unavailable:
process.on('unhandledRejection', (err) => console.error('Unhandled promise rejection:', err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}...`));
