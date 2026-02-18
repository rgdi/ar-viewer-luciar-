
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import db, { dataDir } from '../database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod';

// Middleware: Auth Check
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Config Multer — uploads go into the data directory (Docker volume)
const uploadsRoot = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadsRoot)) {
    fs.mkdirSync(uploadsRoot, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure user directory exists
        const userDir = path.join(uploadsRoot, req.user.id);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() !== '.glb') {
            return cb(new Error('Only .glb files are allowed'));
        }
        cb(null, true);
    }
});

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File too large. Maximum size is 200MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

// GET / (List user's models)
router.get('/', requireAuth, (req, res) => {
    const stmt = db.prepare('SELECT * FROM models WHERE user_id = ? ORDER BY created_at DESC');
    const models = stmt.all(req.user.id);
    res.json(models);
});

// POST / (Upload)
router.post('/', requireAuth, upload.single('file'), handleMulterError, (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { name, description } = req.body;
    const id = uuidv4();
    // Path relative to uploads root: userID/filename
    const storagePath = `${req.user.id}/${req.file.filename}`;

    const stmt = db.prepare('INSERT INTO models (id, user_id, name, description, storage_path) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, req.user.id, name, description, storagePath);

    res.status(201).json({ id, name, storage_path: storagePath });
});

// GET /:id (Get single model metadata - Public)
router.get('/:id', (req, res) => {
    const stmt = db.prepare('SELECT * FROM models WHERE id = ?');
    const model = stmt.get(req.params.id);
    if (!model) return res.status(404).json({ error: 'Not found' });
    res.json(model);
});

// POST /:id/view (Increment view count)
router.post('/:id/view', (req, res) => {
    const stmt = db.prepare('UPDATE models SET views = views + 1 WHERE id = ?');
    const info = stmt.run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
});

export default router;
