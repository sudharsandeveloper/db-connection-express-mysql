

const express = require('express');
const app = express();
const connection = require('./config/db');

const jwt = require('jsonwebtoken');
const secret = require('./config/secret-key.json');

app.use(express.json())
app.use(express.urlencoded({ extended : true }))

app.use("/",(req, res)=>{
    res.json('hello')
})

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }
  
    jwt.verify(token, secret.secret, (err, decoded) => {
      if (err) {
        console.error('Error verifying token:', err);
        return res.status(401).json({ message: 'Failed to authenticate token' });
      }
      next();
    });
  };

app.get('/users', verifyToken, (req, res) => {
    connection.query('SELECT * FROM users', (error, results) => {
      if (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.json(results);
    });
  });
  
  app.post('/register', (req, res) => {
    const {name, email, password, status} = req.body;
    // console.log(name, email, password, status);
    // return
    connection.query('INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, ?)', [name, email, password, status], (err) => {
        if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
        }

        const token = jwt.sign({name} , secret.secret);

        res.json({ token });
    });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
