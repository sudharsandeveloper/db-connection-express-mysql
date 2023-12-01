// app.js

const express = require('express');
const app = express();
const db = require('./config/db'); // Import the MySQL connection module

// Your routes and middleware go here

// Example route using the MySQL connection

app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.json(results);
    });
  });
  

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
