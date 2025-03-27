const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { resolve } = require('path');

const app = express();
const port = 3010;


app.use(express.json());
app.use(express.static('static'));


mongoose.connect('mongodb://localhost:27017/socialmedia', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));


const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);


app.get('/', (req, res) => {
    res.sendFile(resolve(__dirname, 'pages/index.html'));
});
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if fields are provided
  if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
  }

  try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user
      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();

      res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
});



app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Successful login
        res.status(200).json({ message: 'Login successful', user: { username: user.username, email: user.email } });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
