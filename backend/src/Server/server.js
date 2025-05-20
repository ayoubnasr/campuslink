import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../auth/auth.js'; // Import the auth router
import fypRoutes from '../foryou/fyp_backend.js'; // Import the fyp router
import userRoutes from '../user/user_backend.js'; // Import the user router
import cabinetRoutes from '../cabinet/cabinet_backend.js'; // Import the cabinet router
import discoveryRoutes from '../discovery/discovery_backend.js'; // Import the discovery router

dotenv.config({ path: '../../../.env' });

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_URL_DEVELOPMENT];

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));
app.use(express.json());

//TODO: change to a more secure way
app.use('/uploads', express.static('/home/ayoub/campuslink/backend/src/cabinet/uploads'));
app.use('/compressed', express.static('/home/ayoub/campuslink/backend/src/cabinet/compressed'));

app.use('/api/auth', authRoutes);
app.use('/api/fyp', fypRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cabinet', cabinetRoutes);
app.use('/api/discovery', discoveryRoutes);

// Start the server
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}...`));