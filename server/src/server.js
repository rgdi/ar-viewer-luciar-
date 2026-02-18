
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

// Init app
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
            imgSrc: ["'self'", "data:", "blob:", "https://unpkg.com", "https://www.gstatic.com"],
            connectSrc: ["'self'", "https://unpkg.com", "https://www.gstatic.com", "blob:", "data:"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
            workerSrc: ["'self'", "blob:"],
            upgradeInsecureRequests: null,
        }
    }
}));

// 2. CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// 4. Logging
app.use(morgan('combined'));

// 5. Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. Database Init (must happen before routes that use it, and before serving uploads path)
import { initDb, dataDir } from './database.js';
initDb();

// 7. Serve uploaded files from the data directory (Docker volume)
const uploadsPath = path.join(dataDir, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// 8. Serve Frontend (Unified Deployment)
app.use('/assets', express.static(path.join(__dirname, '../../assets')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});
app.get('/viewer.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../viewer.html'));
});

// 9. Routes
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Data directory: ${dataDir}`);
});
