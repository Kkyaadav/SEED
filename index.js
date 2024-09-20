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


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
