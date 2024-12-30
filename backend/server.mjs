import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import natural from 'natural';
import winkSentiment from 'wink-sentiment';

import 'dotenv/config';

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });


// Create a schema for sentiment analysis results
const SentimentSchema = new mongoose.Schema({
  text: String,
  sentiment: String,
  score: Number,
  timestamp: { type: Date, default: Date.now }
});

const Sentiment = mongoose.model('Sentiment', SentimentSchema);

// Middleware
app.use(express.json());

// Sentiment analysis endpoint
app.post('/analyze', async (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Perform sentiment analysis using natural and wink-sentiment
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text);
  const result = winkSentiment(tokens.join(' '));

  // Determine sentiment label
  let sentiment;
  if (result.score > 0) {
    sentiment = 'Positive';
  } else if (result.score < 0) {
    sentiment = 'Negative';
  } else {
    sentiment = 'Neutral';
  }

  // Save result to MongoDB
  const sentimentResult = new Sentiment({
    text,
    sentiment,
    score: result.score
  });

  try {
    await sentimentResult.save();
    res.json({ sentiment, score: result.score });
  } catch (err) {
    res.status(500).json({ error: 'Error saving to database' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
