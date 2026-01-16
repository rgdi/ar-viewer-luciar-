
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod';

// POST /signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = uuidv4();

        const stmt = db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)');
        stmt.run(id, email, hashedPassword);

        // Auto-login
        const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            user: { id, email },
            token
        });

    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        const user = stmt.get(email);

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            user: { id: user.id, email: user.email },
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
