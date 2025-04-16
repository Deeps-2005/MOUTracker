const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mouRoutes = require('./routes/mouRoutes');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/mou', mouRoutes);

// User login/signup storage
const usersFile = './users.json';
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([]));

app.post('/api/register', (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersFile));
  const { email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  users.push({ email, password });
  fs.writeFileSync(usersFile, JSON.stringify(users));
  res.json({ message: 'Registered successfully' });
});

app.post('/api/login', (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersFile));
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ message: 'Login successful' });
});

app.use('/uploads', express.static('uploads'));


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
