// const express = require('express');
// const mysql = require('mysql2');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
// require('dotenv').config()
// const app = express();
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }));
// const salt=10;
// import {registerMail} from './utils/mailSend'

// const db = mysql.createConnection({
//     host: process.env.HOST,
//     user: process.env.USER,
//     password: process.env.PASSWORD,
//     database: process.env.DATABASE
// });

// db.connect((err) => {
//     if (err) throw err;
//     console.log('Connected to MySQL');
// });


// app.post('/register', (req, res) => {
   
//     const first_name=req.body.first_name;
//     const last_name=req.body.last_name;
//     const phone=req.body.phone;
//     const email=req.body.email;
//     const password=req.body.password;
   

//     const checkQuery = 'SELECT * FROM user WHERE email = ?';
//     db.query(checkQuery, [email], (err, results) => {
//         if (err) throw err;

//         if (results.length > 0) {
//             res.send('User already exists');
//         } else {
            
//             bcrypt.hash(password, salt, (err, hash) => {
//                 if (err) throw err;

//                 const insertQuery = 'INSERT INTO user (first_name,last_name,phone,email, password) VALUES (?,?,?,?, ?)';
//                 db.query(insertQuery, [first_name,last_name,phone,email, hash], (err, result) => {
//                     if (err) throw err;
//                     res.send('User registered successfully');
//                     registerMail(email,'SAMSUNG SEED team.','<h1>Registered Successfully</h1>');
//                 });
//             });
//         }
//     });
// });


// app.post('/login', (req, res) => {
//     const { email, password } = req.body;

 
//     const query = 'SELECT * FROM user WHERE email = ?';
//     db.query(query, [email], (err, results) => {
//         if (err) throw err;

//         if (results.length > 0) {
//             const user = results[0];

//             bcrypt.compare(password, user.password, (err, isMatch) => {
//                 if (err) throw err;

//                 if (isMatch) {
//                     res.send('Login successful');
//                 } else {
//                     res.send('Invalid password');
//                 }
//             });
//         } else {
//             res.send('No user found with that email');
//         }
//     });
// });

// app.listen(process.env.PORT || 3000, () => {
//     console.log('Server running on port '+process.env.PORT);
// });

import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { registerMail } from './utils/mailSend.js';

dotenv.config(); // Load environment variables

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const salt = 10;

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

app.post('/register', (req, res) => {
    const { first_name, last_name, phone, email, password } = req.body;

    const checkQuery = 'SELECT * FROM user WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            res.send('User already exists');
        } else {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) throw err;

                const insertQuery = 'INSERT INTO user (first_name, last_name, phone, email, password) VALUES (?, ?, ?, ?, ?)';
                db.query(insertQuery, [first_name, last_name, phone, email, hash], (err, result) => {
                    if (err) throw err;
                    res.send('User registered successfully');
                    registerMail(email, 'SAMSUNG SEED team', first_name);
                });
            });
        }
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM user WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const user = results[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
