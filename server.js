const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Hardcoded user (for this practice)
const user = {
  username: "guri",
  password: "1234"
};

// Secret key for signing JWT
const SECRET_KEY = "bankapi_secret_key";

// Dummy bank account data
let balance = 5000;

// ✅ LOGIN Route - Generates JWT token
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === user.username && password === user.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// 🔒 Middleware to verify JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: "Token missing" });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// 💰 GET Balance
app.get('/balance', verifyToken, (req, res) => {
  res.json({ message: `Current balance for ${req.user.username} is ₹${balance}` });
});

// 💵 Deposit Money
app.post('/deposit', verifyToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }
  balance += amount;
  res.json({ message: `Deposited ₹${amount}. New balance: ₹${balance}` });
});

// 💸 Withdraw Money
app.post('/withdraw', verifyToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }
  if (amount > balance) {
    return res.status(400).json({ message: "Insufficient balance" });
  }
  balance -= amount;
  res.json({ message: `Withdrew ₹${amount}. Remaining balance: ₹${balance}` });
});

// 🟢 Start Server
app.listen(3000, () => {
  console.log("🚀 Banking API running on http://localhost:3000");
});
