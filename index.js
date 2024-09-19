import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { registerMail } from './utils/mailSend.js';
import { forgotPasswordMail } from './utils/mailSend.js';
import jwt from 'jsonwebtoken';

dotenv.config(); // Load environment variables

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const salt = 10;

// MySQL Database connection
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Register User
app.post('/register', (req, res) => {
    const { first_name, last_name, phone, email, password } = req.body;

    const checkQuery = 'SELECT * FROM user WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) return res.status(500).send('Database error');

        if (results.length > 0) {
            res.send('User already exists');
        } else {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) return res.status(500).send('Error hashing the password');

                const insertQuery = 'INSERT INTO user (first_name, last_name, phone, email, password) VALUES (?, ?, ?, ?, ?)';
                db.query(insertQuery, [first_name, last_name, phone, email, hash], (err, result) => {
                    if (err) return res.status(500).send('Database error');
                    res.send('User registered successfully');

                    // Send registration email
                    registerMail(email, 'SAMSUNG SEED team', first_name);
                });
            });
        }
    });
});

// Login User
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM user WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).send('Database error');

        if (results.length > 0) {
            const user = results[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) return res.status(500).send('Error comparing password');

                if (isMatch) {
                    res.send('Login successful');
                } else {
                    res.send('Invalid password');
                }
            });
        } else {
            res.send('No user found with that email');
        }
    });
});

// Forgot Password - Send Reset Link
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    const checkQuery = 'SELECT * FROM user WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) return res.status(500).send('Database error');

        if (results.length === 0) {
            return res.status(404).send('No user found with that email');
        }

        const user = results[0];

        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '10m' });
        console.log(`Generated Token: ${resetToken}`);  //just to print the token

        const updateQuery = 'UPDATE user SET reset_token = ? WHERE email = ?';
        db.query(updateQuery, [resetToken, email], (err) => {
            if (err) return res.status(500).send('Database error');

            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

            forgotPasswordMail(email, user.first_name, resetLink);
            res.send('Password reset link has been sent to your email');
        });
    });
});

// Reset Password
app.post('/reset-password', (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const checkQuery = 'SELECT * FROM user WHERE id = ?';
        db.query(checkQuery, [decoded.id], (err, results) => {
            if (err) return res.status(500).send('Database error');

            if (results.length === 0) {
                return res.status(400).send('Invalid or expired token');
            }

            const user = results[0];

            bcrypt.hash(newPassword, salt, (err, hash) => {
                if (err) return res.status(500).send('Error hashing the password');

                const updateQuery = 'UPDATE user SET password = ?, reset_token = NULL WHERE id = ?';
                db.query(updateQuery, [hash, user.id], (err) => {
                    if (err) return res.status(500).send('Database error');
                    res.send('Password reset successful');
                });
            });
        });
    } catch (err) {
        res.status(400).send('Invalid or expired token');
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
