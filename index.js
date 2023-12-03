

const express = require('express');
const app = express();
const connection = require('./config/db');

const jwt = require('jsonwebtoken');
const secret = require('./config/secret-key.json');

app.use(express.json())
// app.use(express.urlencoded({ extended : true }))


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
      req.decoded = decoded;
      next();
    });
  };

app.get('/profile', verifyToken, (req, res) => {

  const decoded = req.decoded;
  const userId = decoded.userId;
    // console.log(userId)
    connection.query('SELECT * from users where id = ?', [userId], (error, results) => {
      if (error) {
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

    connection.query('select * from users where email = ?', [email], (err, results) => {
      // console.log(results);
      // console.log(results.length)
      if(results.length <= 0){
        connection.query('INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, ?)', [name, email, password, status], (err, results) => {
          if (err) {
          console.error('Error registering user:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
          }
  
          const userId = results.insertId;
          console.log(userId);
          // res.json(results)
  
          const token = jwt.sign({ userId: userId } , secret.secret);
  
          res.json({ token });
      });
      }else{
        res.json({message: 'This email already registered'})
      }
    })
    // connection.query('INSERT INTO users (name, email, password, status) VALUES (?, ?, ?, ?)', [name, email, password, status], (err, results) => {
    //     if (err) {
    //     console.error('Error registering user:', err);
    //     return res.status(500).json({ message: 'Internal Server Error' });
    //     }

    //     const userId = results.insertId;
    //     console.log(userId);
    //     // res.json(results)

    //     const token = jwt.sign({ userId: userId } , secret.secret);

    //     res.json({ token });
    // });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    // console.log(user)
    // return
    if(password == user.password){
      const token = jwt.sign({ userId: user.id } , secret.secret);
      res.json({ token });
    }else{
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});


app.get('/',(req, res)=>{
  res.json('hello');
})

app.use((req, res) => {
  res.status(404).send('This URL is Not Found');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
