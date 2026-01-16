
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// Load env vars
dotenv.config();

// Init app
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow loading resources (models) from other origins if needed, or same origin
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://aframe.io", "https://raw.githack.com", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
            imgSrc: ["'self'", "data:", "blob:", "https://unpkg.com", "https://www.gstatic.com"],
            connectSrc: ["'self'", "https://unpkg.com", "https://www.gstatic.com", "blob:", "data:"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
            workerSrc: ["'self'", "blob:"],
            upgradeInsecureRequests: null, // Disable auto-upgrade to HTTPS for non-SSL servers
        }
    }
}));

// 2. CORS (Configure strictly for production)
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // TODO: User should lock this down in .env
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate Limiting (Prevent abuse)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// 4. Logging
app.use(morgan('combined'));

// 5. Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. Serve Static Files (Models)
app.use('/uploads', express.static(uploadDir));

// 7. Serve Frontend (Unified Deployment)
// Serve assets
app.use('/assets', express.static(path.join(__dirname, '../../assets')));

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});
app.get('/viewer.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../viewer.html'));
});

// 7. Database Init (Moved down to keep order logical)
import { initDb } from './database.js';
initDb();

// 8. Routes
import authRoutes from './routes/auth.js';
import modelRoutes from './routes/models.js';

app.use('/api/auth', authRoutes);
app.use('/api/models', modelRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Uploads directory: ${uploadDir}`);
});
