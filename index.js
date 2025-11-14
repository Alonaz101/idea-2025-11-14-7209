const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost/moodrecipeapp', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// User schema and model
const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  passwordHash: {type: String, required: true},
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  moodHistory: [{ mood: String, date: Date }],
  dietaryPreferences: [String]
});
const User = mongoose.model('User', userSchema);

// Recipe schema and model
const recipeSchema = new mongoose.Schema({
  title: String,
  moodTags: [String],
  dietaryTags: [String],
  ingredients: [String],
  instructions: String
});
const Recipe = mongoose.model('Recipe', recipeSchema);

const JWT_SECRET = 'your_jwt_secret_here';

// Signup
app.post('/api/auth/signup', async (req, res) => {
  const {username, email, password} = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = new User({username, email, passwordHash});
    await user.save();
    res.status(201).json({message: 'User created'});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const {email, password} = req.body;
  const user = await User.findOne({email});
  if (!user) {
    return res.status(401).json({error: 'Invalid email or password'});
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({error: 'Invalid email or password'});
  }
  const token = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: '1h'});
  res.json({token});
});

// Middleware to verify JWT
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({error: 'No token provided'});
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({error: 'Invalid token'});
    req.userId = decoded.userId;
    next();
  });
}

// Get recipes by mood and dietary filters
app.get('/api/recipes', async (req, res) => {
  const mood = req.query.mood || '';
  const dietary = req.query.dietary ? req.query.dietary.split(',') : [];

  const filter = {};
  if (mood) filter.moodTags = mood;
  if (dietary.length > 0) filter.dietaryTags = { $all: dietary };

  const recipes = await Recipe.find(filter);
  res.json(recipes);
});

// Save favorite recipe
app.post('/api/users/:id/favorites', authenticate, async (req, res) => {
  if (req.userId !== req.params.id) {
    return res.status(403).json({error: 'Unauthorized'});
  }
  const {recipeId} = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user.favorites.includes(recipeId)) {
      user.favorites.push(recipeId);
      await user.save();
    }
    res.json({message: 'Favorite added'});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
});

// Get mood analytics (simple count)
app.get('/api/users/:id/analytics', authenticate, async (req, res) => {
  if (req.userId !== req.params.id) {
    return res.status(403).json({error: 'Unauthorized'});
  }
  try {
    const user = await User.findById(req.userId);
    const stats = {};
    user.moodHistory.forEach(entry => {
      stats[entry.mood] = (stats[entry.mood] || 0) + 1;
    });
    res.json(stats);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
});

// Share recipe placeholder
app.post('/api/recipes/share', authenticate, (req, res) => {
  // Just a placeholder for social sharing
  res.json({message: 'Shared recipe to social media (mock)'});
});

// Mood detection microservice proxy
const axios = require('axios');
app.post('/api/mood-detect', async (req, res) => {
  try {
    // Simulate call to AI microservice
    const text = req.body.text || '';
    // Here would be actual AI detection, mock response below
    const mood = text.toLowerCase().includes('happy') ? 'happy' : 'neutral';
    res.json({mood});
  } catch (error) {
    res.status(500).json({error: 'Mood detection failed'});
  }
});

// Grocery order placeholder
app.post('/api/grocery/orders', authenticate, (req, res) => {
  // Placeholder for grocery order integration
  res.json({message: 'Order placed successfully (mock)'});
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
